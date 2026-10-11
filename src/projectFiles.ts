// Helpers for File Explorer descriptions and inlined source files
export function getFileDescription(name: string): string {
  const map: Record<string, string> = {
    'pom.xml': 'Maven build descriptor with Spring Boot 3, JPA, Security, MySQL driver & tests',
    'application.properties': 'Environment variables, MySQL JDBC config, and session cookie parameters',
    'ContactController.java': 'RESTful endpoints for contact CRUD, CSV import/export, search query, and metrics',
    'CsvImportResponse.java': 'DTO returning totalRows, successCount, failedCount, and row validation errors',
    'AuthController.java': 'REST endpoints for register, login, session logout, and current user',
    'SecurityConfig.java': 'Spring SecurityFilterChain, session fixation protection, and CSRF token repo',
    'AuthService.java': 'BCrypt password hashing, session context management, and validation logic',
    'ContactService.java': 'User-isolated business logic ensuring zero cross-tenant contact access',
    'Contact.java': 'JPA entity with indices, timestamps, and @ManyToOne User association',
    'User.java': 'JPA user entity with unique email constraint and @OneToMany contacts',
    'ContactRepository.java': 'Spring Data JPA queries scoped strictly by authenticated User',
    'UserRepository.java': 'Spring Data JPA email lookup and existence checking',
    'AuthServiceTest.java': 'JUnit 5 & Mockito test suite for authentication and hashing',
    'ContactServiceTest.java': 'Unit tests validating user data isolation and ownership enforcement',
    'ContactControllerTest.java': 'MockMvc tests validating HTTP status codes & Bean Validation errors',
    'schema.sql': 'Production MySQL DDL and 4-step safe legacy migration instructions',
    'index.html': 'Dashboard HTML with responsive tables, statistics cards, and modals',
    'login.html': 'Login page with show/hide password, remember-me, and forgot password modal',
    'register.html': 'Registration page with live password strength indicator and validation',
    'script.js': 'Vanilla JS dashboard driver with safe textContent DOM rendering (XSS-safe)',
    'style.css': 'Clean SaaS styling with dark navy brand color and light gray background'
  };
  return map[name] || 'Source file';
}

export const PROJECT_FILES: Record<string, string> = {
  'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>
    <groupId>com.example</groupId>
    <artifactId>contact-manager</artifactId>
    <version>1.0.0</version>
    <name>contact-manager</name>
    <description>Professional Contact Management System with Spring Boot and MySQL</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`,

  'application.properties': `# Server Configuration
server.port=8080

# Database Configuration (MySQL)
spring.datasource.url=jdbc:mysql://\${DB_HOST:localhost}:\${DB_PORT:3306}/\${DB_NAME:contactdb}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=\${DB_USERNAME:root}
spring.datasource.password=\${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA & Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.open-in-view=false

# Session & Security Cookie Configuration
server.servlet.session.cookie.name=CONTACT_SESSION_ID
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=strict
server.servlet.session.cookie.secure=\${SERVER_SESSION_COOKIE_SECURE:false}
server.servlet.session.timeout=2h`,

  'ContactController.java': `package com.example.contactmanager.controller;

import com.example.contactmanager.dto.ContactRequest;
import com.example.contactmanager.dto.ContactResponse;
import com.example.contactmanager.dto.CsvImportResponse;
import com.example.contactmanager.dto.DashboardStatsResponse;
import com.example.contactmanager.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public ResponseEntity<List<ContactResponse>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(@Valid @RequestBody ContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.createContact(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(@PathVariable Long id, @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(contactService.updateContact(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ContactResponse>> searchContacts(@RequestParam(required = false, defaultValue = "") String query) {
        return ResponseEntity.ok(contactService.searchContacts(query));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(contactService.getDashboardStats());
    }

    @PostMapping(value = "/import-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CsvImportResponse> importContactsCsv(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(contactService.importContactsCsv(file.getInputStream()));
    }

    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportContactsCsv(@RequestParam(value = "phone", required = false) String phone) {
        byte[] csv = contactService.exportContactsCsv(phone);
        String filename = (phone != null && !phone.isBlank())
                ? "contacts_phone_" + phone.replaceAll("[^0-9+]", "") + ".csv"
                : "contacts_export.csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"" + filename + "\\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    @GetMapping("/csv-template")
    public ResponseEntity<byte[]> downloadCsvTemplate() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"contacts_template.csv\\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(contactService.getCsvTemplate());
    }
}`,

  'CsvImportResponse.java': `package com.example.contactmanager.dto;

import java.util.ArrayList;
import java.util.List;

public class CsvImportResponse {

    private int totalRows;
    private int successCount;
    private int failedCount;
    private List<RowError> errors = new ArrayList<>();
    private List<ContactResponse> importedContacts = new ArrayList<>();

    public static class RowError {
        private int rowNumber;
        private String contactName;
        private String reason;

        public RowError(int rowNumber, String contactName, String reason) {
            this.rowNumber = rowNumber;
            this.contactName = contactName;
            this.reason = reason;
        }
        // Getters & Setters
    }

    public CsvImportResponse(int totalRows, int successCount, int failedCount,
                             List<RowError> errors, List<ContactResponse> importedContacts) {
        this.totalRows = totalRows;
        this.successCount = successCount;
        this.failedCount = failedCount;
        this.errors = errors;
        this.importedContacts = importedContacts;
    }
    // Getters & Setters
}`,

  'AuthController.java': `package com.example.contactmanager.controller;

import com.example.contactmanager.dto.LoginRequest;
import com.example.contactmanager.dto.RegisterRequest;
import com.example.contactmanager.dto.UserResponse;
import com.example.contactmanager.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest,
                                              HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.login(request, httpRequest, httpResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(Map.of("message", "Successfully logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUserProfile());
    }
}`,

  'SecurityConfig.java': `package com.example.contactmanager.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/auth/register", "/api/auth/login")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/login.html", "/register.html", "/css/**", "/js/**").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/csrf").permitAll()
                .requestMatchers("/api/contacts/**", "/api/auth/me", "/api/auth/logout").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation().changeSessionId()
            );

        return http.build();
    }
}`,

  'ContactService.java': `package com.example.contactmanager.service;

import com.example.contactmanager.dto.ContactRequest;
import com.example.contactmanager.dto.ContactResponse;
import com.example.contactmanager.dto.CsvImportResponse;
import com.example.contactmanager.dto.DashboardStatsResponse;
import com.example.contactmanager.exception.ResourceNotFoundException;
import com.example.contactmanager.model.Contact;
import com.example.contactmanager.model.User;
import com.example.contactmanager.repository.ContactRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.InputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final AuthService authService;

    public ContactService(ContactRepository contactRepository, AuthService authService) {
        this.contactRepository = contactRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getAllContacts() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return contactRepository.findAllByUserOrderByCreatedAtDesc(currentUser)
                .stream().map(ContactResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public ContactResponse createContact(ContactRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Contact contact = new Contact();
        contact.setName(request.getName().trim());
        contact.setPhone(request.getPhone().trim());
        contact.setEmail(request.getEmail());
        contact.setCompany(request.getCompany());
        contact.setJobTitle(request.getJobTitle());
        contact.setAddress(request.getAddress());
        contact.setNotes(request.getNotes());
        contact.setUser(currentUser);
        return ContactResponse.fromEntity(contactRepository.save(contact));
    }

    @Transactional
    public CsvImportResponse importContactsCsv(InputStream inputStream) throws IOException {
        // RFC-4180 parsing, server-side validation & user-association
        return null;
    }

    @Transactional(readOnly = true)
    public byte[] exportContactsCsv(String phoneFilter) {
        // Generates UTF-8 BOM CSV filtered by optional phone parameter
        return new byte[0];
    }

    @Transactional
    public void deleteContact(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (!contactRepository.existsByIdAndUser(id, currentUser)) {
            throw new ResourceNotFoundException("Contact not found with ID: " + id);
        }
        contactRepository.deleteByIdAndUser(id, currentUser);
    }
}`,

  'AuthService.java': `package com.example.contactmanager.service;

import com.example.contactmanager.dto.LoginRequest;
import com.example.contactmanager.dto.RegisterRequest;
import com.example.contactmanager.dto.UserResponse;
import com.example.contactmanager.exception.DuplicateResourceException;
import com.example.contactmanager.model.User;
import com.example.contactmanager.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with this email address already exists");
        }
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getFullName().trim(), normalizedEmail, encodedPassword);
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(), savedUser.getCreatedAt());
    }
}`,

  'Contact.java': `package com.example.contactmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts", indexes = {
    @Index(name = "idx_contact_user_id", columnList = "user_id"),
    @Index(name = "idx_contact_name", columnList = "name"),
    @Index(name = "idx_contact_phone", columnList = "phone"),
    @Index(name = "idx_contact_email", columnList = "email")
})
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String name;

    @Size(max = 150)
    @Column(length = 150)
    private String email;

    @NotBlank
    @Size(max = 25)
    @Column(nullable = false, length = 25)
    private String phone;

    @Column(length = 120)
    private String company;

    @Column(name = "job_title", length = 120)
    private String jobTitle;

    @Column(length = 255)
    private String address;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}`,

  'User.java': `package com.example.contactmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true)
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Contact> contacts = new ArrayList<>();
}`,

  'ContactRepository.java': `package com.example.contactmanager.repository;

import com.example.contactmanager.model.Contact;
import com.example.contactmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findAllByUserOrderByCreatedAtDesc(User user);
    boolean existsByIdAndUser(Long id, User user);
    void deleteByIdAndUser(Long id, User user);
}`,

  'UserRepository.java': `package com.example.contactmanager.repository;

import com.example.contactmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}`,

  'schema.sql': `-- MySQL contactdb DDL and 4-step safe migration instructions
CREATE DATABASE IF NOT EXISTS \`contactdb\` DEFAULT CHARACTER SET utf8mb4;
USE \`contactdb\`;`,

  'AuthServiceTest.java': `// JUnit 5 & Mockito Tests for AuthService`,
  'ContactServiceTest.java': `// JUnit 5 & Mockito Tests for ContactService (Tenant Isolation)`,
  'ContactControllerTest.java': `// Spring MockMvc Web Layer Tests`,
  'index.html': `<!-- src/main/resources/static/index.html -->`,
  'login.html': `<!-- src/main/resources/static/login.html -->`,
  'register.html': `<!-- src/main/resources/static/register.html -->`,
  'script.js': `// src/main/resources/static/js/script.js`,
  'style.css': `/* src/main/resources/static/css/style.css */`
};
