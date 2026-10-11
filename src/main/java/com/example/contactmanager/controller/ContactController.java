package com.example.contactmanager.controller;

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
        List<ContactResponse> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContactById(@PathVariable Long id) {
        ContactResponse contact = contactService.getContactById(id);
        return ResponseEntity.ok(contact);
    }

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(@Valid @RequestBody ContactRequest request) {
        ContactResponse createdContact = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdContact);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(
            @PathVariable Long id,
            @Valid @RequestBody ContactRequest request) {
        ContactResponse updatedContact = contactService.updateContact(id, request);
        return ResponseEntity.ok(updatedContact);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ContactResponse>> searchContacts(
            @RequestParam(required = false, defaultValue = "") String query) {
        List<ContactResponse> contacts = contactService.searchContacts(query);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = contactService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @PostMapping(value = "/import-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CsvImportResponse> importContactsCsv(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please select a non-empty CSV file to upload");
        }
        CsvImportResponse response = contactService.importContactsCsv(file.getInputStream());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportContactsCsv(@RequestParam(value = "phone", required = false) String phone) {
        byte[] csvBytes = contactService.exportContactsCsv(phone);

        String filename = (phone != null && !phone.trim().isEmpty())
                ? "contacts_phone_" + phone.replaceAll("[^0-9+]", "") + ".csv"
                : "contacts_export.csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }

    @GetMapping("/csv-template")
    public ResponseEntity<byte[]> downloadCsvTemplate() {
        byte[] templateBytes = contactService.getCsvTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"contacts_template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(templateBytes);
    }
}
