package com.example.contactmanager.service;

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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

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
                .stream()
                .map(ContactResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContactResponse getContactById(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Contact contact = contactRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with ID: " + id));
        return ContactResponse.fromEntity(contact);
    }

    @Transactional
    public ContactResponse createContact(ContactRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Contact contact = new Contact();
        contact.setName(request.getName().trim());
        contact.setPhone(request.getPhone().trim());
        contact.setEmail(cleanString(request.getEmail()));
        contact.setCompany(cleanString(request.getCompany()));
        contact.setJobTitle(cleanString(request.getJobTitle()));
        contact.setAddress(cleanString(request.getAddress()));
        contact.setNotes(cleanString(request.getNotes()));
        contact.setUser(currentUser);

        Contact savedContact = contactRepository.save(contact);
        return ContactResponse.fromEntity(savedContact);
    }

    @Transactional
    public ContactResponse updateContact(Long id, ContactRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Contact contact = contactRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with ID: " + id));

        contact.setName(request.getName().trim());
        contact.setPhone(request.getPhone().trim());
        contact.setEmail(cleanString(request.getEmail()));
        contact.setCompany(cleanString(request.getCompany()));
        contact.setJobTitle(cleanString(request.getJobTitle()));
        contact.setAddress(cleanString(request.getAddress()));
        contact.setNotes(cleanString(request.getNotes()));

        Contact updatedContact = contactRepository.save(contact);
        return ContactResponse.fromEntity(updatedContact);
    }

    @Transactional
    public void deleteContact(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        if (!contactRepository.existsByIdAndUser(id, currentUser)) {
            throw new ResourceNotFoundException("Contact not found with ID: " + id);
        }

        contactRepository.deleteByIdAndUser(id, currentUser);
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> searchContacts(String query) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (query == null || query.trim().isEmpty()) {
            return getAllContacts();
        }

        return contactRepository.searchContactsByUser(currentUser, query.trim())
                .stream()
                .map(ContactResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        User currentUser = authService.getCurrentAuthenticatedUser();

        long total = contactRepository.countByUser(currentUser);
        long withEmail = contactRepository.countContactsWithEmail(currentUser);
        long withPhone = contactRepository.countContactsWithPhone(currentUser);

        // Contacts created within the last 7 days
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long recentlyAdded = contactRepository.countByUserAndCreatedAtAfter(currentUser, sevenDaysAgo);

        return new DashboardStatsResponse(total, withEmail, withPhone, recentlyAdded);
    }

    /**
     * Bulk CSV Import with server-side parsing & validation
     */
    @Transactional
    public CsvImportResponse importContactsCsv(InputStream inputStream) throws IOException {
        User currentUser = authService.getCurrentAuthenticatedUser();

        List<List<String>> rows = parseCsv(inputStream);
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("The uploaded CSV file is empty");
        }

        List<String> headers = rows.get(0).stream().map(String::trim).map(String::toLowerCase).toList();
        int nameIdx = findHeaderIndex(headers, "name", "full name", "contact name");
        int phoneIdx = findHeaderIndex(headers, "phone", "phone number", "telephone", "mobile");
        int emailIdx = findHeaderIndex(headers, "email", "email address", "mail");
        int companyIdx = findHeaderIndex(headers, "company", "organization", "org");
        int jobTitleIdx = findHeaderIndex(headers, "job title", "title", "role", "position");
        int addressIdx = findHeaderIndex(headers, "address", "location", "street");
        int notesIdx = findHeaderIndex(headers, "notes", "note", "comment", "description");

        if (nameIdx == -1 || phoneIdx == -1) {
            throw new IllegalArgumentException("CSV header must contain at least 'Name' and 'Phone' columns");
        }

        List<CsvImportResponse.RowError> errors = new ArrayList<>();
        List<Contact> contactsToSave = new ArrayList<>();
        int dataRowCount = 0;

        for (int i = 1; i < rows.size(); i++) {
            List<String> row = rows.get(i);
            if (row.isEmpty() || row.stream().allMatch(String::isBlank)) {
                continue; // skip blank rows
            }
            dataRowCount++;
            int rowNumber = i + 1; // 1-based line number including header

            String name = getColumnValue(row, nameIdx);
            String phone = getColumnValue(row, phoneIdx);
            String email = getColumnValue(row, emailIdx);
            String company = getColumnValue(row, companyIdx);
            String jobTitle = getColumnValue(row, jobTitleIdx);
            String address = getColumnValue(row, addressIdx);
            String notes = getColumnValue(row, notesIdx);

            // Row-level validations
            if (name == null || name.isBlank()) {
                errors.add(new CsvImportResponse.RowError(rowNumber, "N/A", "Contact name is required"));
                continue;
            }
            if (name.length() > 120) {
                errors.add(new CsvImportResponse.RowError(rowNumber, name, "Contact name exceeds maximum 120 characters"));
                continue;
            }

            if (phone == null || phone.isBlank()) {
                errors.add(new CsvImportResponse.RowError(rowNumber, name, "Phone number is required"));
                continue;
            }
            if (phone.length() > 25) {
                errors.add(new CsvImportResponse.RowError(rowNumber, name, "Phone number exceeds maximum 25 characters"));
                continue;
            }

            if (email != null && !email.isBlank()) {
                if (email.length() > 150) {
                    errors.add(new CsvImportResponse.RowError(rowNumber, name, "Email address exceeds maximum 150 characters"));
                    continue;
                }
                if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
                    errors.add(new CsvImportResponse.RowError(rowNumber, name, "Invalid email format: " + email));
                    continue;
                }
            }

            Contact contact = new Contact();
            contact.setName(name.trim());
            contact.setPhone(phone.trim());
            contact.setEmail(cleanString(email));
            contact.setCompany(cleanString(company));
            contact.setJobTitle(cleanString(jobTitle));
            contact.setAddress(cleanString(address));
            contact.setNotes(cleanString(notes));
            contact.setUser(currentUser);

            contactsToSave.add(contact);
        }

        List<Contact> savedContacts = contactRepository.saveAll(contactsToSave);
        List<ContactResponse> savedResponses = savedContacts.stream()
                .map(ContactResponse::fromEntity)
                .toList();

        return new CsvImportResponse(
                dataRowCount,
                savedResponses.size(),
                errors.size(),
                errors,
                savedResponses
        );
    }

    /**
     * Export Contacts to CSV format, optionally filtered by phone number
     */
    @Transactional(readOnly = true)
    public byte[] exportContactsCsv(String phoneFilter) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<Contact> userContacts = contactRepository.findAllByUserOrderByCreatedAtDesc(currentUser);

        List<Contact> targetContacts;
        if (phoneFilter != null && !phoneFilter.trim().isEmpty()) {
            String sanitizedPhone = phoneFilter.replaceAll("[^0-9+]", "").toLowerCase();
            targetContacts = userContacts.stream()
                    .filter(c -> {
                        if (c.getPhone() == null) return false;
                        String contactCleanPhone = c.getPhone().replaceAll("[^0-9+]", "").toLowerCase();
                        return contactCleanPhone.contains(sanitizedPhone) || c.getPhone().contains(phoneFilter.trim());
                    })
                    .toList();
        } else {
            targetContacts = userContacts;
        }

        StringBuilder sb = new StringBuilder();
        // UTF-8 BOM for Microsoft Excel compatibility
        sb.append("\uFEFF");
        sb.append("Name,Phone,Email,Company,Job Title,Address,Notes,Created At\r\n");

        for (Contact c : targetContacts) {
            sb.append(escapeCsv(c.getName())).append(",");
            sb.append(escapeCsv(c.getPhone())).append(",");
            sb.append(escapeCsv(c.getEmail())).append(",");
            sb.append(escapeCsv(c.getCompany())).append(",");
            sb.append(escapeCsv(c.getJobTitle())).append(",");
            sb.append(escapeCsv(c.getAddress())).append(",");
            sb.append(escapeCsv(c.getNotes())).append(",");
            sb.append(escapeCsv(c.getCreatedAt() != null ? c.getCreatedAt().toString() : "")).append("\r\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Returns a ready-to-use CSV template for bulk importing
     */
    public byte[] getCsvTemplate() {
        String template = "\uFEFFName,Phone,Email,Company,Job Title,Address,Notes\r\n" +
                "\"Sarah Jenkins\",\"+1 (555) 349-2041\",\"sarah.j@acme.com\",\"Acme Corporation\",\"Managing Partner\",\"450 Lexington Ave, New York, NY\",\"Key strategic client\"\r\n" +
                "\"Marcus Chen\",\"+1 (555) 892-1104\",\"marcus.c@vertex.io\",\"Vertex Systems\",\"VP Infrastructure\",\"100 Montgomery St, San Francisco, CA\",\"Primary engineering contact\"\r\n";
        return template.getBytes(StandardCharsets.UTF_8);
    }

    // Helper: RFC 4180 CSV Parser supporting quoted fields, inner quotes, and commas
    private List<List<String>> parseCsv(InputStream inputStream) throws IOException {
        List<List<String>> records = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            StringBuilder multiLineBuffer = new StringBuilder();
            boolean insideQuotes = false;

            while ((line = reader.readLine()) != null) {
                // Strip BOM on first line if present
                if (records.isEmpty() && multiLineBuffer.length() == 0 && line.startsWith("\uFEFF")) {
                    line = line.substring(1);
                }

                if (multiLineBuffer.length() > 0) {
                    multiLineBuffer.append("\n");
                }
                multiLineBuffer.append(line);

                // Count non-escaped quotes
                long quoteCount = multiLineBuffer.chars().filter(ch -> ch == '"').count();
                if (quoteCount % 2 != 0) {
                    insideQuotes = true;
                    continue; // continuation of multi-line field
                } else {
                    insideQuotes = false;
                }

                records.add(parseCsvRecord(multiLineBuffer.toString()));
                multiLineBuffer.setLength(0);
            }

            if (insideQuotes && multiLineBuffer.length() > 0) {
                records.add(parseCsvRecord(multiLineBuffer.toString()));
            }
        }
        return records;
    }

    private List<String> parseCsvRecord(String recordStr) {
        List<String> tokens = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < recordStr.length(); i++) {
            char c = recordStr.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < recordStr.length() && recordStr.charAt(i + 1) == '"') {
                    cur.append('"');
                    i++; // skip escaped quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                tokens.add(cur.toString().trim());
                cur.setLength(0);
            } else {
                cur.append(c);
            }
        }
        tokens.add(cur.toString().trim());
        return tokens;
    }

    private int findHeaderIndex(List<String> headers, String... candidates) {
        for (int i = 0; i < headers.size(); i++) {
            String h = headers.get(i);
            for (String c : candidates) {
                if (h.equalsIgnoreCase(c)) {
                    return i;
                }
            }
        }
        return -1;
    }

    private String getColumnValue(List<String> row, int index) {
        if (index >= 0 && index < row.size()) {
            String val = row.get(index);
            return (val != null && !val.isBlank()) ? val.trim() : null;
        }
        return null;
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private String cleanString(String input) {
        if (input == null || input.trim().isEmpty()) {
            return null;
        }
        return input.trim();
    }
}
