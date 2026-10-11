package com.example.contactmanager.service;

import com.example.contactmanager.dto.LoginRequest;
import com.example.contactmanager.dto.RegisterRequest;
import com.example.contactmanager.dto.UserResponse;
import com.example.contactmanager.exception.DuplicateResourceException;
import com.example.contactmanager.exception.UnauthorizedException;
import com.example.contactmanager.model.User;
import com.example.contactmanager.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private HttpServletRequest httpRequest;

    @Mock
    private HttpServletResponse httpResponse;

    @Mock
    private HttpSession httpSession;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Alice Developer", "alice@example.com", "$2a$12$hashedPasswordExample");
        sampleUser.setId(1L);
        sampleUser.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should successfully register a new user with hashed password")
    void register_Success() {
        RegisterRequest request = new RegisterRequest("Alice Developer", "alice@example.com", "SecurePass123!", "SecurePass123!");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("$2a$12$hashedPasswordExample");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        UserResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("alice@example.com", response.getEmail());
        assertEquals("Alice Developer", response.getFullName());
        verify(passwordEncoder).encode("SecurePass123!");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should reject registration when passwords do not match")
    void register_PasswordMismatch_ThrowsException() {
        RegisterRequest request = new RegisterRequest("Alice Developer", "alice@example.com", "Password123!", "DifferentPass123!");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertEquals("Passwords do not match", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject registration when email already exists")
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest("Alice Developer", "alice@example.com", "SecurePass123!", "SecurePass123!");
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should authenticate user and return profile on valid credentials")
    void login_Success() {
        LoginRequest request = new LoginRequest("alice@example.com", "SecurePass123!", false);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(httpRequest.getSession(true)).thenReturn(httpSession);
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));

        UserResponse response = authService.login(request, httpRequest, httpResponse);

        assertNotNull(response);
        assertEquals("alice@example.com", response.getEmail());
        verify(httpSession).setMaxInactiveInterval(2 * 60 * 60);
    }

    @Test
    @DisplayName("Should throw UnauthorizedException on invalid password without disclosing details")
    void login_BadCredentials_ThrowsUnauthorizedException() {
        LoginRequest request = new LoginRequest("alice@example.com", "WrongPassword", false);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () ->
                authService.login(request, httpRequest, httpResponse));

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    @DisplayName("Should invalidate session upon logout")
    void logout_InvalidatesSession() {
        when(httpRequest.getSession(false)).thenReturn(httpSession);

        authService.logout(httpRequest);

        verify(httpSession).invalidate();
    }
}
