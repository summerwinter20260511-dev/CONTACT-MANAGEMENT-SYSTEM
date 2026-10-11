package com.example.contactmanager.repository;

import com.example.contactmanager.model.Contact;
import com.example.contactmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findAllByUserOrderByCreatedAtDesc(User user);

    Optional<Contact> findByIdAndUser(Long id, User user);

    boolean existsByIdAndUser(Long id, User user);

    void deleteByIdAndUser(Long id, User user);

    @Query("SELECT c FROM Contact c WHERE c.user = :user AND (" +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.company) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.address) LIKE LOWER(CONCAT('%', :query, '%'))" +
           ") ORDER BY c.createdAt DESC")
    List<Contact> searchContactsByUser(@Param("user") User user, @Param("query") String query);

    long countByUser(User user);

    @Query("SELECT COUNT(c) FROM Contact c WHERE c.user = :user AND c.email IS NOT NULL AND TRIM(c.email) <> ''")
    long countContactsWithEmail(@Param("user") User user);

    @Query("SELECT COUNT(c) FROM Contact c WHERE c.user = :user AND c.phone IS NOT NULL AND TRIM(c.phone) <> ''")
    long countContactsWithPhone(@Param("user") User user);

    long countByUserAndCreatedAtAfter(User user, LocalDateTime since);
}
