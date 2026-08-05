package com.project.aicrm.service;

import com.project.aicrm.config.ResourceNotFoundException;
import com.project.aicrm.entity.Note;
import com.project.aicrm.repository.NoteRepository;
import com.project.aicrm.tenant.TenantContext;
import com.project.aicrm.tenant.TenantSecurity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoteService {

    private static final Logger logger = LoggerFactory.getLogger(NoteService.class);

    private final NoteRepository noteRepository;
    private final TenantSecurity tenantSecurity;
    private final RagIngestionService ragIngestionService;

    public NoteService(NoteRepository noteRepository,
                       TenantSecurity tenantSecurity,
                       RagIngestionService ragIngestionService) {
        this.noteRepository = noteRepository;
        this.tenantSecurity = tenantSecurity;
        this.ragIngestionService = ragIngestionService;
    }

    @Transactional
    public Note create(Note input) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        input.setTenantId(tenantId);
        if (input.getAuthorId() == null) input.setAuthorId(tenantSecurity.currentUserId());
        Note saved = noteRepository.save(input);
        indexAsync(saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Note> forEntity(String entityType, Long entityId) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return noteRepository.findByTenantIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(
                tenantId, entityType, entityId);
    }

    @Transactional(readOnly = true)
    public Page<Note> list(Pageable pageable) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return noteRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional
    public Note update(Long id, String body) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Note n = noteRepository.findById(id)
                .filter(note -> note.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + id));
        n.setBody(body);
        Note saved = noteRepository.save(n);
        indexAsync(saved);
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Note n = noteRepository.findById(id)
                .filter(note -> note.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + id));
        noteRepository.delete(n);
        ragIngestionService.deleteForEntity(n.getEntityType(), n.getEntityId());
    }

    private void indexAsync(Note note) {
        try {
            ragIngestionService.indexNote(note);
        } catch (Exception e) {
            logger.warn("RAG indexing failed for note {}: {}", note.getId(), e.getMessage());
        }
    }
}
