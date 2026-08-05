package com.project.aicrm.repository;

import com.project.aicrm.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByIdAndTenantId(Long id, Long tenantId);
    Page<Task> findByTenantId(Long tenantId, Pageable pageable);
    Page<Task> findByTenantIdAndStatus(Long tenantId, Task.Status status, Pageable pageable);
    Page<Task> findByTenantIdAndAssigneeId(Long tenantId, Long assigneeId, Pageable pageable);
    List<Task> findByTenantIdAndRelatedTypeAndRelatedId(Long tenantId, String relatedType, Long relatedId);

    /** Upcoming non-done tasks ordered by due date — used by the dashboard. */
    List<Task> findTop10ByTenantIdAndStatusNotOrderByDueAtAsc(Long tenantId, Task.Status status);
}
