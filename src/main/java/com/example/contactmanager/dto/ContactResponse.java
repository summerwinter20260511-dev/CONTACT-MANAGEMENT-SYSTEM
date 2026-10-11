package com.example.contactmanager.dto;

import com.example.contactmanager.model.Contact;
import java.time.LocalDateTime;

public class ContactResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String company;
    private String jobTitle;
    private String address;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ContactResponse() {
    }

    public ContactResponse(Contact contact) {
        if (contact != null) {
            this.id = contact.getId();
            this.name = contact.getName();
            this.email = contact.getEmail();
            this.phone = contact.getPhone();
            this.company = contact.getCompany();
            this.jobTitle = contact.getJobTitle();
            this.address = contact.getAddress();
            this.notes = contact.getNotes();
            this.createdAt = contact.getCreatedAt();
            this.updatedAt = contact.getUpdatedAt();
        }
    }

    public static ContactResponse fromEntity(Contact contact) {
        return new ContactResponse(contact);
    }

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
}
