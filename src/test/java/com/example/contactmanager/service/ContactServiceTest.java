package com.example.contactmanager.service;

import com.example.contactmanager.dto.ContactRequest;
import com.example.contactmanager.dto.ContactResponse;
import com.example.contactmanager.dto.DashboardStatsResponse;
import com.example.contactmanager.exception.ResourceNotFoundException;
import com.example.contactmanager.model.Contact;
import com.example.contactmanager.model.User;
import com.example.contactmanager.repository.ContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private ContactService contactService;

    private User userAlice;
    private User userBob;
    private Contact contactAlice;

    @BeforeEach
    void setUp() {
        userAlice = new User("Alice Developer", "alice@example.com", "hashA");
        userAlice.setId(1L);

        userBob = new User("Bob Manager", "bob@example.com", "hashB");
        userBob.setId(2L);

        contactAlice = new Contact("John Doe", "+1-555-0199", "john@company.com", "Acme Inc", "Engineer", "123 Main St", "Important contact", userAlice);
        contactAlice.setId(100L);
        contactAlice.setCreatedAt(LocalDateTime.now());
        contactAlice.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should return only contacts belonging to current authenticated user")
    void getAllContacts_ReturnsUserScopedContacts() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(userAlice);
        when(contactRepository.findAllByUserOrderByCreatedAtDesc(userAlice)).thenReturn(List.of(contactAlice));

        List<ContactResponse> contacts = contactService.getAllContacts();

        assertEquals(1, contacts.size());
        assertEquals("John Doe", contacts.get(0).getName());
        verify(contactRepository).findAllByUserOrderByCreatedAtDesc(userAlice);
    }

    @Test
    @DisplayName("Should create contact associated strictly with authenticated user")
    void createContact_AssociatesWithCurrentUser() {
        ContactRequest request = new ContactRequest("Jane Smith", "+1-555-0188", "jane@corp.org", "TechCorp", "Lead", "456 Oak St", "New client");

        when(authService.getCurrentAuthenticatedUser()).thenReturn(userAlice);
        when(contactRepository.save(any(Contact.class))).thenAnswer(invocation -> {
            Contact saved = invocation.getArgument(0);
            saved.setId(101L);
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        ContactResponse response = contactService.createContact(request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals("Jane Smith", response.getName());
        verify(contactRepository).save(argThat(c -> c.getUser().equals(userAlice)));
    }

    @Test
    @DisplayName("Should prevent cross-user contact access when updating")
    void updateContact_DifferentUser_ThrowsResourceNotFound() {
        ContactRequest request = new ContactRequest("Updated Name", "+1-555-0000", null, null, null, null, null);

        // Bob tries to update Alice's contact (ID 100)
        when(authService.getCurrentAuthenticatedUser()).thenReturn(userBob);
        when(contactRepository.findByIdAndUser(100L, userBob)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> contactService.updateContact(100L, request));
        verify(contactRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete contact when owned by current user")
    void deleteContact_Success() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(userAlice);
        when(contactRepository.existsByIdAndUser(100L, userAlice)).thenReturn(true);

        contactService.deleteContact(100L);

        verify(contactRepository).deleteByIdAndUser(100L, userAlice);
    }

    @Test
    @DisplayName("Should compute dashboard stats dynamically for current user")
    void getDashboardStats_ComputesMetrics() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(userAlice);
        when(contactRepository.countByUser(userAlice)).thenReturn(10L);
        when(contactRepository.countContactsWithEmail(userAlice)).thenReturn(8L);
        when(contactRepository.countContactsWithPhone(userAlice)).thenReturn(10L);
        when(contactRepository.countByUserAndCreatedAtAfter(eq(userAlice), any(LocalDateTime.class))).thenReturn(3L);

        DashboardStatsResponse stats = contactService.getDashboardStats();

        assertEquals(10L, stats.getTotalContacts());
        assertEquals(8L, stats.getContactsWithEmail());
        assertEquals(10L, stats.getContactsWithPhone());
        assertEquals(3L, stats.getRecentlyAddedCount());
    }
}
