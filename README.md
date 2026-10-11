# Professional Contact Management System

A full-stack, production-ready Contact Management System built with **Java Spring Boot**, **Spring Data JPA**, **Spring Security**, **MySQL**, and a responsive **Vanilla HTML5, CSS3, and JavaScript** frontend.

---

## 1. Features

- **User Authentication & Authorization**:
  - Registration with duplicate email detection, password strength validation, and confirmation checks.
  - BCrypt password hashing (work factor 12) — plaintext passwords are never stored or logged.
  - Session-based authentication with `HttpOnly` and `SameSite=Strict` cookies.
  - CSRF protection enabled using `CookieCsrfTokenRepository`.
  - Generic authentication errors to prevent account enumeration.
- **Strict User-Specific Contact Isolation**:
  - Every contact is tied to the authenticated user's ID via `@ManyToOne`.
  - All queries (list, search, get by ID, update, delete) are scoped to the authenticated user.
  - Changing an ID in an HTTP request cannot access or mutate another user's contact (returns HTTP 404).
- **Dynamic Dashboard Metrics**:
  - Live statistical cards for Total Contacts, Contacts with Email, Contacts with Phone, and Recently Added (last 7 days).
- **Full Contact CRUD & Search**:
  - Real-time debounced search by name, phone, email, company, and address.
  - Modal dialogs for adding, editing, viewing, and confirming deletion.
  - XSS-safe DOM rendering using `textContent` and programmatic element creation (no unsafe `innerHTML`).

---

## 2. Technology Stack

- **Backend**: Java 17+, Spring Boot 3.2.5, Spring Web, Spring Data JPA, Spring Security, Hibernate Validator.
- **Database**: MySQL 8.0+ (`contactdb`), H2 Database (for in-memory test profiles).
- **Build Tool**: Apache Maven 3.8+.
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), Inter / Plus Jakarta Sans typography.

---

## 3. Project Directory Structure

```
.
├── pom.xml                                           # Maven dependencies and build plugins
├── schema.sql                                        # MySQL DDL and safe migration instructions
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── example
│   │   │           └── contactmanager
│   │   │               ├── ContactManagerApplication.java
│   │   │               ├── controller
│   │   │               │   ├── AuthController.java
│   │   │               │   └── ContactController.java
│   │   │               ├── dto
│   │   │               │   ├── ContactRequest.java
│   │   │               │   ├── ContactResponse.java
│   │   │               │   ├── DashboardStatsResponse.java
│   │   │               │   ├── LoginRequest.java
│   │   │               │   ├── RegisterRequest.java
│   │   │               │   └── UserResponse.java
│   │   │               ├── exception
│   │   │               │   ├── DuplicateResourceException.java
│   │   │               │   ├── ErrorResponse.java
│   │   │               │   ├── GlobalExceptionHandler.java
│   │   │               │   ├── ResourceNotFoundException.java
│   │   │               │   └── UnauthorizedException.java
│   │   │               ├── model
│   │   │               │   ├── Contact.java
│   │   │               │   └── User.java
│   │   │               ├── repository
│   │   │               │   ├── ContactRepository.java
│   │   │               │   └── UserRepository.java
│   │   │               ├── security
│   │   │               │   ├── CustomUserDetailsService.java
│   │   │               │   └── SecurityConfig.java
│   │   │               └── service
│   │   │                   ├── AuthService.java
│   │   │                   └── ContactService.java
│   │   └── resources
│   │       ├── application.properties               # Main database and server configuration
│   │       └── static                               # Vanilla Frontend served directly by Spring Boot
│   │           ├── css
│   │           │   ├── auth.css
│   │           │   └── style.css
│   │           ├── index.html                       # Contact Dashboard
│   │           ├── login.html                       # Login Page
│   │           ├── register.html                    # Registration Page
│   │           └── js
│   │               ├── login.js
│   │               ├── register.js
│   │               └── script.js
│   └── test
│       ├── java
│       │   └── com
│       │       └── example
│       │           └── contactmanager
│       │               ├── controller
│       │               │   └── ContactControllerTest.java
│       │               └── service
│       │                   ├── AuthServiceTest.java
│       │                   └── ContactServiceTest.java
│       └── resources
│           └── application-test.properties          # H2 in-memory DB for automated testing
└── README.md
```

---

## 4. Local Setup and Execution

### Step 1: Install Prerequisites
1. **Java Development Kit (JDK)**: JDK 17 or higher (Eclipse Temurin, Oracle JDK, or Amazon Corretto).
   Verify installation:
   ```bash
   java -version
   ```
2. **Apache Maven**: Version 3.8 or higher.
   Verify installation:
   ```bash
   mvn -version
   ```

### Step 2: Set Up MySQL Database
1. Start your local MySQL service.
2. Log into the MySQL client:
   ```bash
   mysql -u root -p
   ```
3. Execute the database creation statement:
   ```sql
   CREATE DATABASE contactdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Or import the complete `schema.sql` file directly: `mysql -u root -p contactdb < schema.sql`)*

### Step 3: Configure Database Credentials
You can supply your database credentials using environment variables:
- **macOS / Linux**:
  ```bash
  export DB_HOST=localhost
  export DB_PORT=3306
  export DB_NAME=contactdb
  export DB_USERNAME=root
  export DB_PASSWORD=your_mysql_password
  ```
- **Windows (PowerShell)**:
  ```powershell
  $env:DB_HOST="localhost"
  $env:DB_PORT="3306"
  $env:DB_NAME="contactdb"
  $env:DB_USERNAME="root"
  $env:DB_PASSWORD="your_mysql_password"
  ```

### Step 4: Run the Application
In the project root directory, run:
```bash
mvn spring-boot:run
```

Once the terminal outputs `Started ContactManagerApplication in ... seconds`:
1. Open your browser to **http://localhost:8080/login.html**
2. Click **Create Account** or visit **http://localhost:8080/register.html** to create an account.
3. Sign in to access the Dashboard at **http://localhost:8080/index.html**.

### Step 5: Run Automated Tests
To run unit and integration tests (which execute against the H2 in-memory test database and do not affect your MySQL database):
```bash
mvn test
```

---

## 5. REST API Documentation & Example Requests

### Authentication Endpoints

#### 1. Register a New Account
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```bash
  curl -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "Sarah Jenkins",
      "email": "sarah.j@example.com",
      "password": "SecurePassword123!",
      "confirmPassword": "SecurePassword123!"
    }'
  ```
- **Response**: `201 Created`

#### 2. Sign In (Create Session)
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```bash
  curl -i -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "sarah.j@example.com",
      "password": "SecurePassword123!",
      "rememberMe": false
    }'
  ```
- **Response**: `200 OK` (with `Set-Cookie: CONTACT_SESSION_ID=...; Path=/; HttpOnly; SameSite=Strict`)

#### 3. Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Response**: `200 OK` (returns current user details)

#### 4. Sign Out
- **Endpoint**: `POST /api/auth/logout`
- **Response**: `200 OK`

---

### Contact Management Endpoints

#### 1. Retrieve All Contacts (User-Scoped)
- **Endpoint**: `GET /api/contacts`
- **Response**: `200 OK` (array of contacts owned by the authenticated user)

#### 2. Create a Contact
- **Endpoint**: `POST /api/contacts`
- **Request Body**:
  ```bash
  curl -X POST http://localhost:8080/api/contacts \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: <token-from-cookie>" \
    -d '{
      "name": "David Wallace",
      "phone": "+1 (555) 302-8811",
      "email": "david.w@dundermifflin.com",
      "company": "Dunder Mifflin Paper Co.",
      "jobTitle": "Chief Financial Officer",
      "address": "1725 Slough Ave, Scranton, PA 18504",
      "notes": "Discuss quarterly enterprise supply agreements."
    }'
  ```
- **Response**: `201 Created`

#### 3. Update an Existing Contact
- **Endpoint**: `PUT /api/contacts/{id}`
- **Response**: `200 OK` (or `404 Not Found` if ID belongs to another user)

#### 4. Delete a Contact
- **Endpoint**: `DELETE /api/contacts/{id}`
- **Response**: `204 No Content`

#### 5. Search Contacts
- **Endpoint**: `GET /api/contacts/search?query=wallace`
- **Response**: `200 OK`

#### 6. Dashboard Metrics
- **Endpoint**: `GET /api/contacts/stats`
- **Response**: `200 OK` (`totalContacts`, `contactsWithEmail`, `contactsWithPhone`, `recentlyAddedCount`)

#### 7. Bulk Import Contacts from CSV
- **Endpoint**: `POST /api/contacts/import-csv`
- **Request (Multipart Form-Data)**:
  ```bash
  curl -X POST http://localhost:8080/api/contacts/import-csv \
    -H "X-XSRF-TOKEN: <token-from-cookie>" \
    -F "file=@contacts.csv"
  ```
- **Response Body**: `200 OK`
  ```json
  {
    "totalRows": 15,
    "successCount": 14,
    "failedCount": 1,
    "errors": [
      {
        "rowNumber": 4,
        "contactName": "Invalid Lead",
        "reason": "Phone number is required"
      }
    ],
    "importedContacts": [...]
  }
  ```

#### 8. Export Contacts to CSV (With Optional Phone Filter)
- **Endpoint**: `GET /api/contacts/export-csv` or `GET /api/contacts/export-csv?phone=+15553492041`
- **Description**: Returns a standard RFC 4180 CSV file with UTF-8 BOM. When `phone` query parameter is supplied, only contacts matching that phone number are returned.
  ```bash
  # Export all contacts
  curl -O http://localhost:8080/api/contacts/export-csv

  # Export contacts filtered by phone number
  curl -O "http://localhost:8080/api/contacts/export-csv?phone=%2B15553492041"
  ```
- **Response**: `200 OK` (with `Content-Type: text/csv; charset=UTF-8` and `Content-Disposition: attachment; filename="contacts_export.csv"`)

#### 9. Download CSV Import Template
- **Endpoint**: `GET /api/contacts/csv-template`
- **Response**: `200 OK` (`contacts_template.csv` pre-populated with example records and header columns)

---

## 6. Database Migration Guide for Upgrading Existing Deployments

If you have an existing contact database without user ownership:
1. **Never drop the contacts table** or assign contacts to arbitrary users.
2. Execute the 4-step migration sequence documented in `schema.sql`:
   - Create the `users` table.
   - Add a nullable `user_id` column to `contacts`.
   - Assign existing contacts to an administrator or map them by existing company email.
   - Alter `user_id` to `NOT NULL` and add the foreign key constraint `fk_contacts_user`.

---

## 7. Troubleshooting Common Issues

1. **`Access denied for user 'root'@'localhost'`**:
   Verify your MySQL password and ensure the `DB_PASSWORD` environment variable matches your local MySQL setup.
2. **`Communications link failure`**:
   Ensure your MySQL service is active (`systemctl status mysql` or `brew services list`).
3. **`Port 8080 is already in use`**:
   Specify an alternate port in `application.properties` (e.g. `server.port=8081`) or launch with `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081`.
