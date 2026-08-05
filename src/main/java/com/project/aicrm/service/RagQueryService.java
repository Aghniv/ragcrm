package com.project.aicrm.service;

import com.project.aicrm.tenant.TenantContext;
import com.project.aicrm.tenant.TenantSecurity;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Tenant-scoped natural-language search.
 *
 * Every vector query is filtered by tenantId so a user in tenant A
 * can never see tenant B's data — even if the embedding model would
 * otherwise return it as a near match.
 */
@Service
public class RagQueryService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final TenantSecurity tenantSecurity;

    public RagQueryService(VectorStore vectorStore, ChatClient.Builder chatClientBuilder, TenantSecurity tenantSecurity) {
        this.vectorStore = vectorStore;
        this.chatClient = chatClientBuilder.build();
        this.tenantSecurity = tenantSecurity;
    }

    /**
     * Returns the raw documents that match the query, filtered to the caller's tenant.
     * Use this for "show me what you found" searches.
     */
    public List<Document> search(String query, int topK) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();

        SearchRequest req = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .filterExpression("tenantId == " + tenantId)
                .build();
        return vectorStore.similaritySearch(req);
    }

    /**
     * Returns an LLM-generated answer grounded in the matching documents.
     * The ChatClient is augmented with a {@link QuestionAnswerAdvisor} that injects
     * retrieved chunks into the prompt automatically.
     */
    public String answer(String question, int topK) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();

        SearchRequest req = SearchRequest.builder()
                .query(question)
                .topK(topK)
                .filterExpression("tenantId == " + tenantId)
                .build();

        try {
            QuestionAnswerAdvisor advisor = QuestionAnswerAdvisor.builder(vectorStore)
                    .searchRequest(req)
                    .build();

            return chatClient.prompt()
                    .advisors(advisor)
                    .user(question)
                    .call()
                    .content();
        } catch (Exception e) {
            // Attempt simple similarity search list to build textual response, otherwise default message
            try {
                List<Document> docs = search(question, topK);
                if (docs.isEmpty()) {
                    return "RagQuery offline. No matched context in CRM data: " + e.getMessage();
                }
                StringBuilder sb = new StringBuilder();
                sb.append("RagQuery offline fallback. Matched sources:\n\n");
                for (Document d : docs) {
                    sb.append("- ").append(d.getText()).append("\n");
                }
                return sb.toString();
            } catch (Exception se) {
                return "AI query is unavailable. LLM service (Ollama) or Vector DB connection issues: " + e.getMessage();
            }
        }
    }


    public List<Map<String, Object>> searchAsMap(String query, int topK) {
        return search(query, topK).stream()
                .map(d -> {
                    Map<String, Object> entry = new java.util.HashMap<>();
                    entry.put("id", d.getId());
                    entry.put("content", d.getText());
                    entry.put("metadata", d.getMetadata());
                    return entry;
                })
                .collect(Collectors.toList());
    }
}
