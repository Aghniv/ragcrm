package com.project.aicrm.service;

import com.project.aicrm.entity.Lead;
import com.project.aicrm.entity.Note;
import com.project.aicrm.repository.NoteRepository;
import com.project.aicrm.tenant.TenantContext;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Summarizes a lead's profile + notes into a concise narrative.
 */
@Service
public class AiSummaryService {

    private final ChatClient chatClient;
    private final NoteRepository noteRepository;

    public AiSummaryService(ChatClient.Builder chatClientBuilder, NoteRepository noteRepository) {
        this.chatClient = chatClientBuilder.build();
        this.noteRepository = noteRepository;
    }

    public String summarize(Lead lead) {
        Long tenantId = TenantContext.get();
        List<Note> notes = (tenantId != null)
                ? noteRepository.findByTenantIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(tenantId, "LEAD", lead.getId())
                : List.of();

        StringBuilder notesBlock = new StringBuilder();
        if (notes.isEmpty()) {
            notesBlock.append("(no notes yet)");
        } else {
            for (Note n : notes) {
                notesBlock.append("- ").append(n.getCreatedAt()).append(": ").append(n.getBody()).append("\n");
            }
        }

        String prompt = """
            Summarize the current state of this sales lead in 3-5 short sentences.
            Highlight key signals, the relationship so far, and what the next action should be.

            Lead profile:
            - Name: %s
            - Company: %s
            - Source: %s
            - Status: %s
            - AI score: %s
            - Urgency: %s
            - Lead notes: %s

            Activity log (most recent first):
            %s

            Output: a single paragraph, no bullets, no headings.
            """.formatted(
                lead.getName(),
                lead.getCompany() != null ? lead.getCompany() : "—",
                lead.getSource() != null ? lead.getSource() : "—",
                lead.getStatus(),
                lead.getScore() != null ? lead.getScore() : "not scored",
                lead.getUrgency() != null ? lead.getUrgency() : "—",
                lead.getNotes() != null ? lead.getNotes() : "(none)",
                notesBlock
            );

        try {
            return chatClient.prompt(prompt).call().content();
        } catch (Exception e) {
            return String.format("Local Summary (LLM Offline): Lead: %s, Company: %s, Source: %s, Status: %s. AI Score: %s, Urgency: %s.",
                lead.getName(),
                lead.getCompany() != null ? lead.getCompany() : "Unknown",
                lead.getSource() != null ? lead.getSource() : "Unknown",
                lead.getStatus(),
                lead.getScore() != null ? lead.getScore() : "Not scored",
                lead.getUrgency() != null ? lead.getUrgency() : "Not analyzed"
            );
        }
    }
}
