package com.project.aicrm.controller;

import com.project.aicrm.service.RagQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final RagQueryService rag;

    public SearchController(RagQueryService rag) {
        this.rag = rag;
    }

    /**
     * POST /api/search?q=...&topK=5
     * Returns matching documents (chunks) only — no LLM call.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "5") int topK) {
        return ResponseEntity.ok(rag.searchAsMap(q, Math.min(Math.max(topK, 1), 50)));
    }

    /**
     * POST /api/search/answer
     * Body: { "question": "...", "topK": 5 }
     * Returns a tenant-scoped, RAG-augmented LLM answer with cited context.
     */
    @PostMapping("/answer")
    public ResponseEntity<Map<String, String>> answer(@RequestBody Map<String, Object> body) {
        String question = (String) body.getOrDefault("question", "");
        int topK = body.containsKey("topK") ? ((Number) body.get("topK")).intValue() : 5;
        if (question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "question is required"));
        }
        String answer = rag.answer(question, Math.min(Math.max(topK, 1), 50));
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
