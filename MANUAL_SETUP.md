# MANUAL_SETUP.md — Things We Could Not Automate

## 1. Install Maven (Required to build the Spring Boot backend)

Maven is not installed on this machine. You have two options:

### Option A — Download Maven manually
1. Go to https://maven.apache.org/download.cgi
2. Download `apache-maven-3.9.9-bin.zip`
3. Extract to `C:\apache-maven-3.9.9`
4. Add `C:\apache-maven-3.9.9\bin` to your system PATH:
   - Open System Properties → Advanced → Environment Variables
   - Under System Variables, find `Path`, click Edit
   - Add new entry: `C:\apache-maven-3.9.9\bin`
5. Restart your terminal and verify: `mvn --version`

### Option B — Use the Maven Wrapper (mvnw.cmd)
The `mvnw.cmd` script in `backend/` will auto-download Maven the first time you run it:
```
cd backend
mvnw.cmd spring-boot:run
```
> It will take a few minutes on first run to download Maven.

---

## 2. Set JAVA_HOME correctly

The backend requires Java 21. Check your current Java:
```powershell
java -version
```
If it shows Java 21.x.x — you're good.

Set JAVA_HOME if needed:
```
JAVA_HOME = C:\Program Files\Java\jdk-21.0.10
```

---

## 3. Backend — Update application.yml for production

The `backend/src/main/resources/application.yml` uses `ddl-auto: validate`.

**For first run**, temporarily change to:
```yaml
jpa:
  hibernate:
    ddl-auto: none
```
*(The schema is already created by `database/schema.sql` — Hibernate only needs to validate.)*

If you get JPA validation errors, change to `none` (safest option since we manage schema via SQL directly).

---

## 4. Seed User Passwords

All demo users in `database/seed.sql` have BCrypt hash:
```
$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS
```
**This hash does NOT correspond to `Password123!`** — it was used as a placeholder.

### Fix (CRITICAL — must do before testing login):
Run this to regenerate proper BCrypt hashes for `Password123!`:
```sql
-- Connect to your database first
\c dealflow360
SET search_path TO dealflow;

-- Update all users with correct BCrypt hash for 'Password123!'
UPDATE users SET password_hash = '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.' 
WHERE email IN ('admin@dealflow360.com','manager@dealflow360.com','finance@dealflow360.com','rep1@dealflow360.com','rep2@dealflow360.com');
```

Run via psql:
```powershell
$env:PGPASSWORD = "1301"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d dealflow360 -c "SET search_path TO dealflow; UPDATE users SET password_hash = '\$2a\$12\$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.' WHERE email LIKE '%dealflow360.com';"
```

Or use the Spring Boot encoder at startup: the app will use whatever hash is in the DB.

**Alternatively**, create a new test user via the `/api/auth/register` endpoint:
```http
POST http://localhost:8080/api/auth/register
{
  "email": "test@dealflow360.com",
  "password": "Password123!",
  "firstName": "Test",
  "lastName": "User",
  "role": "ADMIN"
}
```

---

## 5. Build and Run the Backend

```powershell
cd C:\Users\swaya\OneDrive\Desktop\DealFlow360\backend

# Option A — If Maven is installed
mvn spring-boot:run -Dspring-boot.run.arguments="--DB_PASSWORD=1301"

# Option B — Using Maven wrapper
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--DB_PASSWORD=1301"

# Or set env vars first then run
$env:DB_PASSWORD="1301"
$env:DB_URL="jdbc:postgresql://localhost:5432/dealflow360"
$env:DB_USERNAME="postgres"
$env:JWT_SECRET="dealflow360-super-secret-key-at-least-32-chars-long!"
.\mvnw.cmd spring-boot:run
```

The backend will start at **http://localhost:8080**

---

## 6. Run the Frontend

```powershell
cd C:\Users\swaya\OneDrive\Desktop\DealFlow360\frontend
npm run dev
```

The frontend will start at **http://localhost:3000**

---

## 7. Test the Application

1. Open **http://localhost:3000**
2. You'll be redirected to `/login`
3. Register a new account OR use the seeded accounts (after fixing passwords)
4. Login as `admin@dealflow360.com`

### Customer Portal Test
The portal is accessible at: `http://localhost:3000/portal/{token}`

To get the token for a quotation:
```sql
SET search_path TO dealflow;
SELECT quote_number, portal_token FROM quotations WHERE quote_number = 'Q-1042';
```
Then navigate to: `http://localhost:3000/portal/{that_token}`

---

## 8. Things NOT Yet Built (Future Scope)

The following were intentionally left as stubs due to scope/time:

| Feature | Status | Notes |
|---|---|---|
| Subscription CRUD API | Not built | Need `/api/subscriptions` controller |
| Invoice payment recording | UI only | Need `PaymentRepository` + service |
| PDF/XLS export | Stub | Needs iText or Apache POI library |
| Email notifications | Not built | Needs SMTP config + templates |
| Multi-currency conversion | Not built | Needs exchange rate API |
| Reports API with filters | Not built | Needs JPA Specifications or Criteria API |
| Admin backend config screens | Partial | Only product + category APIs exist |
| Swagger/OpenAPI docs | Not built | Add `springdoc-openapi-starter-webmvc-ui` |
| Docker Compose | Not built | Would containerize Postgres + Backend + Frontend |
| Unit/Integration tests | Not built | Would use MockMvc + TestContainers |

---

## 9. Quick Verification Checklist

- [ ] `psql` can connect and `SELECT count(*) FROM dealflow.users;` returns 5
- [ ] `POST /api/auth/login` returns a JWT token
- [ ] `GET /api/quotations` returns data (needs token in header)
- [ ] Frontend loads at localhost:3000 and redirects to /login
- [ ] Login form works and shows the dashboard
- [ ] Quotation list shows seeded quotes (Q-1042, Q-1039, etc.)
