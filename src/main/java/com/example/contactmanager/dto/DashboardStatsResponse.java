package com.example.contactmanager.dto;

public class DashboardStatsResponse {

    private long totalContacts;
    private long contactsWithEmail;
    private long contactsWithPhone;
    private long recentlyAddedCount;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalContacts, long contactsWithEmail, long contactsWithPhone, long recentlyAddedCount) {
        this.totalContacts = totalContacts;
        this.contactsWithEmail = contactsWithEmail;
        this.contactsWithPhone = contactsWithPhone;
        this.recentlyAddedCount = recentlyAddedCount;
    }

    public long getTotalContacts() {
        return totalContacts;
    }

    public void setTotalContacts(long totalContacts) {
        this.totalContacts = totalContacts;
    }

    public long getContactsWithEmail() {
        return contactsWithEmail;
    }

    public void setContactsWithEmail(long contactsWithEmail) {
        this.contactsWithEmail = contactsWithEmail;
    }

    public long getContactsWithPhone() {
        return contactsWithPhone;
    }

    public void setContactsWithPhone(long contactsWithPhone) {
        this.contactsWithPhone = contactsWithPhone;
    }

    public long getRecentlyAddedCount() {
        return recentlyAddedCount;
    }

    public void setRecentlyAddedCount(long recentlyAddedCount) {
        this.recentlyAddedCount = recentlyAddedCount;
    }
}
