package com.example.contactmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts", indexes = {
    @Index(name = "idx_contact_user_id", columnList = "user_id"),
    @Index(name = "idx_contact_name", columnList = "name"),
    @Index(name = "idx_contact_phone", columnList = "phone"),
    @Index(name = "idx_contact_email", columnList = "email"),
    @Index(name = "idx_contact_company", columnList = "company")
})
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Contact full name is required")
    @Size(max = 120, message = "Name cannot exceed 120 characters")
    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Size(max = 150, message = "Email cannot exceed 150 characters")
    @Column(name = "email", length = 150)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(max = 25, message = "Phone number cannot exceed 25 characters")
    @Column(name = "phone", nullable = false, length = 25)
    private String phone;

    @Size(max = 120, message = "Company cannot exceed 120 characters")
    @Column(name = "company", length = 120)
    private String company;

    @Size(max = 120, message = "Job title cannot exceed 120 characters")
    @Column(name = "job_title", length = 120)
    private String jobTitle;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    @Column(name = "address", length = 255)
    private String address;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_contacts_user"))
    @JsonIgnore
    private User user;

    public Contact() {
    }

    public Contact(String name, String phone, String email, String company, String jobTitle, String address, String notes, User user) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.company = company;
        this.jobTitle = jobTitle;
        this.address = address;
        this.notes = notes;
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.email != null && this.email.isBlank()) {
            this.email = null;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.email != null && this.email.isBlank()) {
            this.email = null;
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
