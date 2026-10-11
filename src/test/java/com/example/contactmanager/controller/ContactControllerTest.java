package com.example.contactmanager.controller;

import com.example.contactmanager.dto.ContactRequest;
import com.example.contactmanager.dto.ContactResponse;
import com.example.contactmanager.exception.ResourceNotFoundException;
import com.example.contactmanager.service.ContactService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContactController.class)
@AutoConfigureMockMvc(addFilters = false) // Focus on controller logic
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ContactService contactService;

    @Test
    @WithMockUser
    @DisplayName("GET /api/contacts should return 200 and contact list")
    void getAllContacts_ReturnsOk() throws Exception {
        ContactResponse c = new ContactResponse();
        c.setId(1L);
        c.setName("John Doe");
        c.setPhone("+1-555-0100");

        when(contactService.getAllContacts()).thenReturn(List.of(c));

        mockMvc.perform(get("/api/contacts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("John Doe"))
                .andExpect(jsonPath("$[0].phone").value("+1-555-0100"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/contacts should validate required fields and return 400 when missing")
    void createContact_MissingRequiredFields_ReturnsBadRequest() throws Exception {
        ContactRequest invalid = new ContactRequest();
        // Missing name and phone

        mockMvc.perform(post("/api/contacts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.phone").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/contacts should return 201 Created on valid input")
    void createContact_ValidInput_ReturnsCreated() throws Exception {
        ContactRequest valid = new ContactRequest("Jane Smith", "+1-555-0200", "jane@corp.com", "Acme", "Lead", "123 Elm", "Notes");

        ContactResponse response = new ContactResponse();
        response.setId(2L);
        response.setName("Jane Smith");
        response.setPhone("+1-555-0200");

        when(contactService.createContact(any(ContactRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/contacts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(valid)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("Jane Smith"));
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/contacts/{id} should return 204 No Content")
    void deleteContact_ReturnsNoContent() throws Exception {
        doNothing().when(contactService).deleteContact(1L);

        mockMvc.perform(delete("/api/contacts/1").with(csrf()))
                .andExpect(status().isNoContent());

        verify(contactService).deleteContact(1L);
    }
}
