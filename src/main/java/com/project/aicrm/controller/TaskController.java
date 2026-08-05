package com.project.aicrm.controller;

import com.project.aicrm.entity.Task;
import com.project.aicrm.service.TaskService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<Task> create(@RequestBody TaskRequest req) {
        Task t = new Task();
        t.setTitle(req.title());
        t.setDescription(req.description());
        t.setAssigneeId(req.assigneeId());
        t.setRelatedType(req.relatedType());
        t.setRelatedId(req.relatedId());
        t.setDueAt(req.dueAt());
        if (req.priority() != null) t.setPriority(req.priority());
        if (req.status() != null) t.setStatus(req.status());
        if (req.aiGenerated() != null) t.setAiGenerated(req.aiGenerated());
        return ResponseEntity.ok(taskService.create(t));
    }

    @GetMapping
    public ResponseEntity<Page<Task>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Task.Status status) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ResponseEntity.ok(taskService.listMine(status, pageable));
    }

    @GetMapping("/for/{type}/{id}")
    public ResponseEntity<List<Task>> forEntity(@PathVariable String type, @PathVariable Long id) {
        return ResponseEntity.ok(taskService.forEntity(type.toUpperCase(), id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> get(@PathVariable Long id) {
        return taskService.get(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable Long id, @RequestBody TaskRequest req) {
        Task patch = new Task();
        patch.setTitle(req.title());
        patch.setDescription(req.description());
        patch.setAssigneeId(req.assigneeId());
        patch.setDueAt(req.dueAt());
        patch.setPriority(req.priority());
        patch.setStatus(req.status());
        return ResponseEntity.ok(taskService.update(id, patch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record TaskRequest(
            @NotBlank String title,
            String description,
            Long assigneeId,
            String relatedType,
            Long relatedId,
            LocalDateTime dueAt,
            Task.Priority priority,
            Task.Status status,
            Boolean aiGenerated
    ) {}
}
