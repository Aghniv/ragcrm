package com.project.aicrm.config;

import com.project.aicrm.entity.*;
import com.project.aicrm.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds a fully populated demo workspace the first time the backend starts.
 * Idempotent: if the {@code demo} tenant already exists, this is a no-op.
 *
 * Controlled by {@code app.demo.enabled} (default {@code true}) so production
 * deployments can opt out with {@code APP_DEMO_ENABLED=false}.
 *
 * <p>Credentials for the seeded account are logged once at INFO so the demo
 * banner on the Login/Register page can stay in sync with the backend.
 */
@Component
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DemoDataSeeder.class);

    public static final String DEMO_TENANT_SLUG = "demo";
    public static final String DEMO_EMAIL = "demo@salespilot.app";
    public static final String DEMO_PASSWORD = "Demo1234";

    private final TenantRepository tenantRepository;
    private final TenantMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ContactRepository contactRepository;
    private final LeadRepository leadRepository;
    private final OpportunityRepository opportunityRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.enabled:true}")
    private boolean enabled;

    public DemoDataSeeder(TenantRepository tenantRepository,
                          TenantMembershipRepository membershipRepository,
                          UserRepository userRepository,
                          CustomerRepository customerRepository,
                          ContactRepository contactRepository,
                          LeadRepository leadRepository,
                          OpportunityRepository opportunityRepository,
                          TaskRepository taskRepository,
                          PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.contactRepository = contactRepository;
        this.leadRepository = leadRepository;
        this.opportunityRepository = opportunityRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            logger.info("Demo data seeding disabled (app.demo.enabled=false).");
            return;
        }
        if (tenantRepository.existsBySlug(DEMO_TENANT_SLUG)) {
            logger.info("Demo workspace already exists — skipping seed.");
            return;
        }

        logger.info("Seeding demo workspace…");

        // --- Tenant + user + membership -----------------------------------
        Tenant tenant = new Tenant();
        tenant.setSlug(DEMO_TENANT_SLUG);
        tenant.setName("Demo Workspace");
        tenant.setPlan("DEMO");
        tenant.setActive(true);
        tenant = tenantRepository.save(tenant);

        User user;
        if (userRepository.existsByEmail(DEMO_EMAIL)) {
            user = userRepository.findByEmail(DEMO_EMAIL).get();
        } else {
            user = new User();
            user.setEmail(DEMO_EMAIL);
            user.setName("Demo User");
            user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
            user.setRole(UserRole.ADMIN);
            user = userRepository.save(user);
        }

        TenantMembership membership = new TenantMembership();
        membership.setUserId(user.getId());
        membership.setTenantId(tenant.getId());
        membership.setRole("OWNER");
        membershipRepository.save(membership);

        Long tid = tenant.getId();
        Long uid = user.getId();

        // --- Customers ----------------------------------------------------
        Customer acme = saveCustomer(tid, uid, "Acme Corp", "Software", "201-1000", "https://acme.example.com",
                "500 Market St, San Francisco, CA");
        Customer globex = saveCustomer(tid, uid, "Globex Industries", "Manufacturing", "1000+", "https://globex.example.com",
                "200 Industrial Way, Chicago, IL");
        Customer initech = saveCustomer(tid, uid, "Initech", "Technology", "51-200", "https://initech.example.com",
                "1 Office Park, Austin, TX");

        // --- Contacts -----------------------------------------------------
        Contact c1 = saveContact(tid, acme.getId(), "Sara Patel", "sara@acme.example.com", "+1-555-0101", "VP of Engineering");
        Contact c2 = saveContact(tid, globex.getId(), "Marcus Lee", "m.lee@globex.example.com", "+1-555-0102", "Procurement Lead");
        Contact c3 = saveContact(tid, initech.getId(), "Diana Park", "diana@initech.example.com", "+1-555-0103", "CTO");

        // --- Leads --------------------------------------------------------
        saveLead(tid, uid, "Olivia Chen", "olivia@northwind.example.com", "+1-555-0201", "Northwind Traders", "Website", LeadStatus.NEW, 82, "HIGH", "Asked for pricing in 24h");
        saveLead(tid, uid, "James Rivera", "j.rivera@acme.example.com", "+1-555-0202", "Acme Corp", "Referral", LeadStatus.QUALIFIED, 91, "HIGH", "Hot — wants demo this week");
        saveLead(tid, uid, "Priya Kapoor", "priya.k@apex.example.com", "+1-555-0203", "Apex Logistics", "LinkedIn", LeadStatus.CONTACTED, 64, "MEDIUM", "Replied to first cold email");
        saveLead(tid, uid, "Ben Carter", "bcarter@stride.example.com", "+1-555-0204", "Stride Marketing", "Cold Call", LeadStatus.NEW, 47, "MEDIUM", "Inbound from gated ebook");
        saveLead(tid, uid, "Mei Lin", "mei@nimbus.example.com", "+1-555-0205", "Nimbus Cloud", "Webinar", LeadStatus.PROPOSAL, 88, "HIGH", "Sent proposal — awaiting feedback");
        saveLead(tid, uid, "Diego Alvarez", "diego@bluebird.example.com", "+1-555-0206", "Bluebird Coffee", "Website", LeadStatus.WON, 95, "LOW", "Closed $24k ARR");
        saveLead(tid, uid, "Hannah Brooks", "h.brooks@vertex.example.com", "+1-555-0207", "Vertex Robotics", "Partner", LeadStatus.LOST, 30, "LOW", "Chose competitor on price");
        saveLead(tid, uid, "Theo Sato", "theo@horizon.example.com", "+1-555-0208", "Horizon Health", "Conference", LeadStatus.QUALIFIED, 76, "HIGH", "Needs SOC2 docs");
        saveLead(tid, uid, "Aisha Khan", "aisha@brightside.example.com", "+1-555-0209", "Brightside Studio", "Website", LeadStatus.NEW, 58, "MEDIUM", "Downloaded pricing sheet");
        saveLead(tid, uid, "Liam O'Connor", "liam@cascade.example.com", "+1-555-0210", "Cascade Energy", "Referral", LeadStatus.CONTACTED, 71, "MEDIUM", "Scheduling a call");

        // --- Opportunities ------------------------------------------------
        saveOpportunity(tid, acme.getId(), c1.getId(), uid, "Acme — Annual License", Opportunity.Stage.NEGOTIATION, new BigDecimal("48000.00"), "USD", LocalDate.now().plusDays(14), 70, "Negotiating MSA terms");
        saveOpportunity(tid, globex.getId(), c2.getId(), uid, "Globex — Pilot Deployment", Opportunity.Stage.PROPOSAL, new BigDecimal("125000.00"), "USD", LocalDate.now().plusDays(30), 55, "Sent SOW Friday");
        saveOpportunity(tid, initech.getId(), c3.getId(), uid, "Initech — Self-serve Tier", Opportunity.Stage.QUALIFICATION, new BigDecimal("18000.00"), "USD", LocalDate.now().plusDays(45), 40, "Discovery call scheduled");
        saveOpportunity(tid, acme.getId(), c1.getId(), uid, "Acme — Add-on Seats", Opportunity.Stage.WON, new BigDecimal("9600.00"), "USD", LocalDate.now().minusDays(5), 100, "Closed-won, expanding seats");

        // --- Tasks --------------------------------------------------------
        saveTask(tid, uid, uid, "Follow up with Olivia on pricing", "Sent the proposal Mon, ping Wed", Task.Priority.HIGH, LocalDateTime.now().plusDays(1), Task.Status.OPEN, true);
        saveTask(tid, uid, uid, "Prep Acme MSA review", "Highlight liability + termination clauses", Task.Priority.URGENT, LocalDateTime.now().plusHours(6), Task.Status.OPEN, false);
        saveTask(tid, uid, uid, "Send Globex SOW signature page", "DocuSign link in HubSpot deal", Task.Priority.MEDIUM, LocalDateTime.now().plusDays(3), Task.Status.OPEN, false);

        logger.info("============================================================");
        logger.info("  DEMO WORKSPACE READY");
        logger.info("  Email:    {}", DEMO_EMAIL);
        logger.info("  Password: {}", DEMO_PASSWORD);
        logger.info("  Tenant:   {} (slug={})", tenant.getName(), tenant.getSlug());
        logger.info("============================================================");
    }

    // ---- helpers ---------------------------------------------------------

    private Customer saveCustomer(Long tid, Long owner, String name, String industry, String size, String website, String address) {
        Customer c = new Customer();
        c.setTenantId(tid);
        c.setName(name);
        c.setIndustry(industry);
        c.setSize(size);
        c.setWebsite(website);
        c.setBillingAddress(address);
        c.setOwnerId(owner);
        return customerRepository.save(c);
    }

    private Contact saveContact(Long tid, Long customerId, String name, String email, String phone, String title) {
        Contact c = new Contact();
        c.setTenantId(tid);
        c.setCustomerId(customerId);
        c.setName(name);
        c.setEmail(email);
        c.setPhone(phone);
        c.setTitle(title);
        return contactRepository.save(c);
    }

    private void saveLead(Long tid, Long owner, String name, String email, String phone, String company,
                          String source, LeadStatus status, Integer score, String urgency, String notes) {
        Lead l = new Lead();
        l.setTenantId(tid);
        l.setName(name);
        l.setEmail(email);
        l.setPhone(phone);
        l.setCompany(company);
        l.setSource(source);
        l.setStatus(status);
        l.setScore(score);
        l.setUrgency(urgency);
        l.setNotes(notes);
        // leadRepository.save — ownerId isn't on Lead, but tenant isolation is via tenantId
        leadRepository.save(l);
    }

    private void saveOpportunity(Long tid, Long customerId, Long contactId, Long owner, String name,
                                 Opportunity.Stage stage, BigDecimal amount, String currency,
                                 LocalDate expectedClose, Integer probability, String description) {
        Opportunity o = new Opportunity();
        o.setTenantId(tid);
        o.setCustomerId(customerId);
        o.setContactId(contactId);
        o.setOwnerId(owner);
        o.setName(name);
        o.setStage(stage);
        o.setAmount(amount);
        o.setCurrency(currency);
        o.setExpectedCloseDate(expectedClose);
        o.setProbabilityPct(probability);
        o.setDescription(description);
        if (stage == Opportunity.Stage.WON || stage == Opportunity.Stage.LOST) {
            o.setClosedAt(LocalDateTime.now().minusDays(5));
        }
        opportunityRepository.save(o);
    }

    private void saveTask(Long tid, Long creator, Long assignee, String title, String description,
                          Task.Priority priority, LocalDateTime dueAt, Task.Status status, boolean aiGenerated) {
        Task t = new Task();
        t.setTenantId(tid);
        t.setCreatorId(creator);
        t.setAssigneeId(assignee);
        t.setTitle(title);
        t.setDescription(description);
        t.setPriority(priority);
        t.setDueAt(dueAt);
        t.setStatus(status);
        t.setAiGenerated(aiGenerated);
        if (status == Task.Status.DONE) t.setCompletedAt(LocalDateTime.now().minusDays(1));
        taskRepository.save(t);
    }
}
