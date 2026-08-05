package com.project.aicrm.service;

import com.project.aicrm.config.ResourceNotFoundException;
import com.project.aicrm.entity.Task;
import com.project.aicrm.repository.TaskRepository;
import com.project.aicrm.tenant.TenantContext;
import com.project.aicrm.tenant.TenantSecurity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TenantSecurity tenantSecurity;

    public TaskService(TaskRepository taskRepository, TenantSecurity tenantSecurity) {
        this.taskRepository = taskRepository;
        this.tenantSecurity = tenantSecurity;
    }

    @Transactional
    public Task create(Task input) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        input.setTenantId(tenantId);
        if (input.getCreatorId() == null) input.setCreatorId(tenantSecurity.currentUserId());
        if (input.getAssigneeId() == null) input.setAssigneeId(tenantSecurity.currentUserId());
        return taskRepository.save(input);
    }

    @Transactional(readOnly = true)
    public Page<Task> listMine(Task.Status status, Pageable pageable) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        if (status != null) return taskRepository.findByTenantIdAndStatus(tenantId, status, pageable);
        return taskRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional(readOnly = true)
    public List<Task> forEntity(String type, Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return taskRepository.findByTenantIdAndRelatedTypeAndRelatedId(tenantId, type, id);
    }

    @Transactional(readOnly = true)
    public Optional<Task> get(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return taskRepository.findByIdAndTenantId(id, tenantId);
    }

    @Transactional
    public Task update(Long id, Task patch) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Task t = taskRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        if (patch.getTitle() != null) t.setTitle(patch.getTitle());
        if (patch.getDescription() != null) t.setDescription(patch.getDescription());
        if (patch.getAssigneeId() != null) t.setAssigneeId(patch.getAssigneeId());
        if (patch.getDueAt() != null) t.setDueAt(patch.getDueAt());
        if (patch.getPriority() != null) t.setPriority(patch.getPriority());
        if (patch.getStatus() != null) {
            t.setStatus(patch.getStatus());
            if (patch.getStatus() == Task.Status.DONE && t.getCompletedAt() == null) {
                t.setCompletedAt(LocalDateTime.now());
            }
            if (patch.getStatus() != Task.Status.DONE) t.setCompletedAt(null);
        }
        return taskRepository.save(t);
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Task t = taskRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        taskRepository.delete(t);
    }
}
