package com.project.aicrm.controller;

import com.project.aicrm.entity.Note;
import com.project.aicrm.service.NoteService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping
    public ResponseEntity<Note> create(@RequestBody NoteRequest req) {
        Note n = new Note();
        n.setEntityType(req.entityType());
        n.setEntityId(req.entityId());
        n.setBody(req.body());
        return ResponseEntity.ok(noteService.create(n));
    }

    @GetMapping("/for/{entityType}/{entityId}")
    public ResponseEntity<List<Note>> forEntity(@PathVariable String entityType, @PathVariable Long entityId) {
        return ResponseEntity.ok(noteService.forEntity(entityType.toUpperCase(), entityId));
    }

    @GetMapping
    public ResponseEntity<Page<Note>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ResponseEntity.ok(noteService.list(pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> update(@PathVariable Long id, @RequestBody NoteRequest req) {
        return ResponseEntity.ok(noteService.update(id, req.body()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        noteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record NoteRequest(
            String entityType,    // LEAD, CUSTOMER, CONTACT, OPPORTUNITY
            Long entityId,
            @NotBlank String body
    ) {}
}
