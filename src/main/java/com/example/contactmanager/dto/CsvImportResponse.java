package com.example.contactmanager.dto;

import java.util.ArrayList;
import java.util.List;

public class CsvImportResponse {

    private int totalRows;
    private int successCount;
    private int failedCount;
    private List<RowError> errors = new ArrayList<>();
    private List<ContactResponse> importedContacts = new ArrayList<>();

    public CsvImportResponse() {
    }

    public CsvImportResponse(int totalRows, int successCount, int failedCount, List<RowError> errors, List<ContactResponse> importedContacts) {
        this.totalRows = totalRows;
        this.successCount = successCount;
        this.failedCount = failedCount;
        this.errors = errors != null ? errors : new ArrayList<>();
        this.importedContacts = importedContacts != null ? importedContacts : new ArrayList<>();
    }

    public static class RowError {
        private int rowNumber;
        private String contactName;
        private String reason;

        public RowError() {
        }

        public RowError(int rowNumber, String contactName, String reason) {
            this.rowNumber = rowNumber;
            this.contactName = contactName;
            this.reason = reason;
        }

        public int getRowNumber() {
            return rowNumber;
        }

        public void setRowNumber(int rowNumber) {
            this.rowNumber = rowNumber;
        }

        public String getContactName() {
            return contactName;
        }

        public void setContactName(String contactName) {
            this.contactName = contactName;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    public int getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(int totalRows) {
        this.totalRows = totalRows;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(int failedCount) {
        this.failedCount = failedCount;
    }

    public List<RowError> getErrors() {
        return errors;
    }

    public void setErrors(List<RowError> errors) {
        this.errors = errors;
    }

    public List<ContactResponse> getImportedContacts() {
        return importedContacts;
    }

    public void setImportedContacts(List<ContactResponse> importedContacts) {
        this.importedContacts = importedContacts;
    }
}
