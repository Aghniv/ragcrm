package com.project.aicrm.repository;

import com.project.aicrm.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByTenantIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(Long tenantId, String entityType, Long entityId);
    Page<Note> findByTenantId(Long tenantId, Pageable pageable);
    void deleteByTenantIdAndEntityTypeAndEntityId(Long tenantId, String entityType, Long entityId);
}
