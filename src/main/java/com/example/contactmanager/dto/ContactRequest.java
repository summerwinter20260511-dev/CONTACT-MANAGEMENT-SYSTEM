package com.example.contactmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ContactRequest {

    @NotBlank(message = "Contact full name is required")
    @Size(max = 120, message = "Name cannot exceed 120 characters")
    private String name;

    @Size(max = 150, message = "Email cannot exceed 150 characters")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(max = 25, message = "Phone number cannot exceed 25 characters")
    private String phone;

    @Size(max = 120, message = "Company cannot exceed 120 characters")
    private String company;

    @Size(max = 120, message = "Job title cannot exceed 120 characters")
    private String jobTitle;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    public ContactRequest() {
    }

    public ContactRequest(String name, String phone, String email, String company, String jobTitle, String address, String notes) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.company = company;
        this.jobTitle = jobTitle;
        this.address = address;
        this.notes = notes;
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
}
