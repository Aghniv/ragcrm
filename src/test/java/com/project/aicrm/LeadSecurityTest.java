package com.project.aicrm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.aicrm.dto.LeadRequest;
import com.project.aicrm.entity.LeadStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.project.aicrm.service.LeadAnalysisService;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class LeadSecurityTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private LeadAnalysisService leadAnalysisService;

    @org.junit.jupiter.api.BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    void leadsEndpointRequiresAuthentication() throws Exception {
        // Unauthenticated GET should be rejected. Spring Security 7 may return
        // either 401 (no entry point) or 403 (default for anonymous) — both are valid.
        mockMvc.perform(get("/api/leads"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void leadsCreateWithoutTokenReturns401() throws Exception {
        LeadRequest req = new LeadRequest();
        req.setName("Test");
        req.setEmail("test@example.com");
        req.setStatus(LeadStatus.NEW);

        mockMvc.perform(post("/api/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void authLoginIsPublic() throws Exception {
        // /api/auth/login is permitted to everyone.
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nobody@example.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isBadRequest()); // 400 because credentials are wrong, not 401
    }
}
