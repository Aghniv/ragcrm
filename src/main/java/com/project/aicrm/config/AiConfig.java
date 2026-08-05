package com.project.aicrm.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

@Configuration
public class AiConfig {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AiConfig.class);

    private final ObjectProvider<EmbeddingModel> embeddingModelProvider;

    public AiConfig(ObjectProvider<EmbeddingModel> embeddingModelProvider) {
        this.embeddingModelProvider = embeddingModelProvider;
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    /**
     * Eagerly call the embedding model at startup so the first real request
     * doesn't pay the model-download / load penalty. Failures are non-fatal
     * — the app still works, the first user request just gets a slow call.
     *
     * Uses ObjectProvider so the bean is optional — tests that don't load
     * Spring AI (e.g. {@code LeadSecurityTest}) can still boot the context.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void warmEmbeddingModel() {
        EmbeddingModel embeddingModel = embeddingModelProvider.getIfAvailable();
        if (embeddingModel == null) {
            log.debug("No EmbeddingModel bean present — skipping warmup");
            return;
        }
        try {
            embeddingModel.embed("warmup");
            log.info("Embedding model warmed up");
        } catch (Exception e) {
            log.warn("Embedding model warmup failed (non-fatal): {}", e.getMessage());
        }
    }
}