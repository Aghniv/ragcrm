package com.project.aicrm.service;

import com.project.aicrm.dto.LeadAnalysisResult;
import com.project.aicrm.entity.Lead;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class LeadAnalysisService {

    private final ChatClient chatClient;

    public LeadAnalysisService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public LeadAnalysisResult analyzeLead(Lead lead) {
        String prompt = """
            Analyze the following lead and provide a quality score (0-100), urgency level (LOW/MEDIUM/HIGH), and a brief summary.

            Lead Information:
            - Name: %s
            - Email: %s
            - Phone: %s
            - Company: %s
            - Source: %s
            - Notes: %s

            Provide your response in this exact format:
            SCORE: [0-100]
            URGENCY: [LOW/MEDIUM/HIGH]
            SUMMARY: [2-3 sentence analysis]
            """.formatted(
                lead.getName(),
                lead.getEmail(),
                lead.getPhone() != null ? lead.getPhone() : "Not provided",
                lead.getCompany() != null ? lead.getCompany() : "Not provided",
                lead.getSource() != null ? lead.getSource() : "Not provided",
                lead.getNotes() != null ? lead.getNotes() : "None"
            );

        String response = chatClient.prompt(prompt).call().content();

        return parseResponse(response);
    }

    private LeadAnalysisResult parseResponse(String response) {
        try {
            Integer score = 50;
            String urgency = "MEDIUM";
            String summary = "Analysis complete";

            String[] lines = response.split("\n");
            for (String line : lines) {
                if (line.startsWith("SCORE:")) {
                    score = Integer.parseInt(line.replace("SCORE:", "").trim());
                } else if (line.startsWith("URGENCY:")) {
                    urgency = line.replace("URGENCY:", "").trim().toUpperCase();
                } else if (line.startsWith("SUMMARY:")) {
                    summary = line.replace("SUMMARY:", "").trim();
                }
            }

            return new LeadAnalysisResult(score, urgency, summary);
        } catch (Exception e) {
            return new LeadAnalysisResult(50, "MEDIUM", "Analysis could not be completed");
        }
    }
}