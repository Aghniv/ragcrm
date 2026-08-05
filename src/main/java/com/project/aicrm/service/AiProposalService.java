package com.project.aicrm.service;

import com.project.aicrm.entity.Opportunity;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

/**
 * Drafts a sales proposal for an opportunity.
 * Returns a structured document with sections the rep can edit.
 */
@Service
public class AiProposalService {

    private final ChatClient chatClient;

    public AiProposalService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String generate(Opportunity opp) {
        String prompt = """
            You are a sales engineer drafting a proposal for a prospect.

            Opportunity:
            - Name: %s
            - Stage: %s
            - Amount: %s %s
            - Expected close: %s
            - Probability: %s%%
            - Description: %s

            Produce a Markdown proposal with these sections (use ## for headings):
            ## Executive Summary
            ## Problem Statement
            ## Proposed Solution
            ## Why Us
            ## Pricing & Timeline
            ## Next Steps

            Keep it concrete. Use the deal size to scale the depth of detail.
            Do not invent specific past-customer names or made-up statistics.
            """.formatted(
                opp.getName(),
                opp.getStage(),
                opp.getAmount() != null ? opp.getAmount() : "TBD",
                opp.getCurrency() != null ? opp.getCurrency() : "USD",
                opp.getExpectedCloseDate() != null ? opp.getExpectedCloseDate() : "TBD",
                opp.getProbabilityPct() != null ? opp.getProbabilityPct() : "?",
                opp.getDescription() != null ? opp.getDescription() : "(no description provided)"
            );

        try {
            return chatClient.prompt(prompt).call().content();
        } catch (Exception e) {
            return String.format(
                "## Proposal: %s (Offline Fallback)\n\n" +
                "**Deal details:**\n" +
                "- Customer: %s\n" +
                "- Amount: %s %s\n" +
                "- Expected Close: %s\n" +
                "- Stage: %s\n" +
                "- Description: %s\n\n" +
                "*(Note: AI-generated proposal details are offline because the LLM service is currently unavailable.)*",
                opp.getName(),
                opp.getCustomerId() != null ? "Customer #" + opp.getCustomerId() : "N/A",
                opp.getAmount() != null ? opp.getAmount() : "TBD",
                opp.getCurrency() != null ? opp.getCurrency() : "USD",
                opp.getExpectedCloseDate() != null ? opp.getExpectedCloseDate() : "TBD",
                opp.getStage(),
                opp.getDescription() != null ? opp.getDescription() : "(none provided)"
            );
        }
    }
}
