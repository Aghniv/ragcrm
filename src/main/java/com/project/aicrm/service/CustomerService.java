package com.project.aicrm.service;

import com.project.aicrm.config.ResourceNotFoundException;
import com.project.aicrm.entity.Customer;
import com.project.aicrm.repository.CustomerRepository;
import com.project.aicrm.tenant.TenantContext;
import com.project.aicrm.tenant.TenantSecurity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final TenantSecurity tenantSecurity;

    public CustomerService(CustomerRepository customerRepository, TenantSecurity tenantSecurity) {
        this.customerRepository = customerRepository;
        this.tenantSecurity = tenantSecurity;
    }

    @Transactional
    public Customer create(Customer input) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        input.setTenantId(tenantId);
        if (input.getOwnerId() == null) input.setOwnerId(tenantSecurity.currentUserId());
        return customerRepository.save(input);
    }

    @Transactional(readOnly = true)
    public Page<Customer> list(String search, Pageable pageable) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        if (search != null && !search.isBlank()) {
            return customerRepository.searchByTenant(tenantId, search.trim(), pageable);
        }
        return customerRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Customer> get(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        return customerRepository.findByIdAndTenantId(id, tenantId);
    }

    @Transactional
    public Customer update(Long id, Customer patch) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Customer c = customerRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        if (patch.getName() != null) c.setName(patch.getName());
        if (patch.getIndustry() != null) c.setIndustry(patch.getIndustry());
        if (patch.getSize() != null) c.setSize(patch.getSize());
        if (patch.getWebsite() != null) c.setWebsite(patch.getWebsite());
        if (patch.getBillingAddress() != null) c.setBillingAddress(patch.getBillingAddress());
        if (patch.getOwnerId() != null) c.setOwnerId(patch.getOwnerId());
        return customerRepository.save(c);
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.require();
        tenantSecurity.requireMemberOfCurrentTenant();
        Customer c = customerRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        customerRepository.delete(c);
    }
}
