package com.project.aicrm.service;

import com.project.aicrm.config.ResourceNotFoundException;
import com.project.aicrm.entity.Contact;
import com.project.aicrm.repository.ContactRepository;
import com.project.aicrm.tenant.TenantContext;
import com.project.aicrm.tenant.TenantSecurity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final TenantSecurity tenantSecurity;

    public ContactService(ContactRepository contactRepository, TenantSecurity tenantSecurity) {
        this.contactRepository = contactRepository;
        this.tenantSecurity = tenantSecurity;
    }

    @Transactional
    public Contact create(Contact input) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        input.setTenantId(tenantId);
        return contactRepository.save(input);
    }

    @Transactional(readOnly = true)
    public Page<Contact> list(Pageable pageable) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return contactRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional(readOnly = true)
    public List<Contact> byCustomer(Long customerId) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return contactRepository.findByTenantIdAndCustomerId(tenantId, customerId);
    }

    @Transactional(readOnly = true)
    public Optional<Contact> get(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return contactRepository.findByIdAndTenantId(id, tenantId);
    }

    @Transactional
    public Contact update(Long id, Contact patch) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Contact c = contactRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + id));
        if (patch.getName() != null) c.setName(patch.getName());
        if (patch.getEmail() != null) c.setEmail(patch.getEmail());
        if (patch.getPhone() != null) c.setPhone(patch.getPhone());
        if (patch.getTitle() != null) c.setTitle(patch.getTitle());
        if (patch.getLinkedin() != null) c.setLinkedin(patch.getLinkedin());
        if (patch.getCustomerId() != null) c.setCustomerId(patch.getCustomerId());
        return contactRepository.save(c);
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Contact c = contactRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + id));
        contactRepository.delete(c);
    }
}
