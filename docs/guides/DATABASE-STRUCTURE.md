# YektaYar Database Structure & Relationships

## Entity Relationship Diagram (Text Format)

```
┌─────────────────────┐
│       USERS         │
│---------------------|
│ id (PK)             │◄─────┐
│ email               │      │
│ phone               │      │
│ name                │      │
│ password_hash       │      │
│ type (enum)         │      │
│ avatar              │      │
│ bio                 │      │
│ specialization      │      │
│ is_active           │      │
│ created_at          │      │
│ updated_at          │      │
└─────────────────────┘      │
         △                    │
         │                    │
         ├────────────────────┼─────────────────────┐
         │                    │                     │
         │                    │                     │
┌────────┴────────┐  ┌───────┴──────────┐  ┌──────┴──────────┐
│   SESSIONS      │  │  APPOINTMENTS    │  │ MESSAGE_THREADS │
│-----------------|  │------------------|  │-----------------|
│ id (PK)         │  │ id (PK)          │  │ id (PK)         │
│ token           │  │ patient_id (FK)  │  │ participants[]  │
│ user_id (FK)    │  │ psychologist(FK) │  │ category        │
│ is_logged_in    │  │ scheduled_at     │  │ status          │
│ metadata        │  │ duration         │  │ created_at      │
│ created_at      │  │ status           │  │ updated_at      │
│ expires_at      │  │ notes            │  └─────────────────┘
│ last_activity   │  │ created_at       │          │
└─────────────────┘  │ updated_at       │          │
                     └──────────────────┘          │
                                                   │
┌─────────────────────┐                           │
│ COURSE_ENROLLMENTS  │                  ┌────────┴──────────┐
│---------------------|                  │    MESSAGES       │
│ id (PK)             │                  │-------------------|
│ user_id (FK)        │◄────┐            │ id (PK)           │
│ course_id (FK)      │     │            │ thread_id (FK)    │
│ progress            │     │            │ sender_id (FK)    │
│ completed           │     │            │ content           │
│ enrolled_at         │     │            │ is_read           │
│ completed_at        │     │            │ created_at        │
└─────────────────────┘     │            └───────────────────┘
                            │
┌─────────────────────┐     │
│      COURSES        │     │
│---------------------|     │
│ id (PK)             │─────┘
│ title               │
│ description         │
│ category            │
│ duration            │
│ difficulty          │
│ thumbnail_url       │
│ is_published        │
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌─────────────────────┐     ┌───────────────────────┐
│   ASSESSMENTS       │     │  ASSESSMENT_RESULTS   │
│---------------------|     │-----------------------|
│ id (PK)             │────►│ id (PK)               │
│ title               │     │ assessment_id (FK)    │
│ description         │     │ user_id (FK)          │
│ questions (JSONB)   │     │ answers (JSONB)       │
│ created_at          │     │ score                 │
│ updated_at          │     │ personality_type      │
└─────────────────────┘     │ completed_at          │
                            └───────────────────────┘

┌─────────────────────┐
│   SUPPORT_TICKETS   │
│---------------------|
│ id (PK)             │
│ user_id (FK)        │
│ subject             │
│ message             │
│ status              │
│ priority            │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│ SUPPORT_MESSAGES    │
│---------------------|
│ id (PK)             │
│ ticket_id (FK)      │
│ sender_type         │
│ message             │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐     ┌───────────────────────┐
│       PAGES         │     │      SETTINGS         │
│---------------------|     │-----------------------|
│ id (PK)             │     │ id (PK)               │
│ slug (unique)       │     │ key (unique)          │
│ title               │     │ value                 │
│ content             │     │ type                  │
│ metadata (JSONB)    │     │ created_at            │
│ created_at          │     │ updated_at            │
│ updated_at          │     └───────────────────────┘
└─────────────────────┘

┌─────────────────────┐
│ USER_PREFERENCES    │
│---------------------|
│ user_id (PK)        │
│ welcome_shown       │
│ language            │
│ theme               │
│ notifications       │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

## Key Relationships

### User-Centric Relationships
- **Users → Sessions**: One-to-Many (A user can have multiple active sessions)
- **Users → Appointments (as Patient)**: One-to-Many
- **Users → Appointments (as Psychologist)**: One-to-Many
- **Users → Messages**: One-to-Many (sender)
- **Users → Course Enrollments**: One-to-Many
- **Users → Assessment Results**: One-to-Many
- **Users → Support Tickets**: One-to-Many

### Course System
- **Courses → Course Enrollments**: One-to-Many
- **Users → Courses** (through enrollments): Many-to-Many

### Assessment System
- **Assessments → Assessment Results**: One-to-Many
- **Users → Assessments** (through results): Many-to-Many

### Messaging System
- **Message Threads → Messages**: One-to-Many
- **Users → Message Threads** (participants): Many-to-Many (via array)
- **Users → Messages** (sender): One-to-Many

### Support System
- **Support Tickets → Support Messages**: One-to-Many
- **Users → Support Tickets**: One-to-Many

## Data Types Used

### Standard Types
- `INTEGER` - IDs, foreign keys, numeric values
- `VARCHAR` - Short strings (names, emails, types)
- `TEXT` - Long text content
- `BOOLEAN` - Flags and switches
- `TIMESTAMP` - Date/time tracking

### Advanced Types
- `JSONB` - Flexible structured data (metadata, questions, answers)
- `INTEGER[]` - Arrays (message thread participants)

## Indexes (Auto-created)

- Primary keys on all tables
- Unique constraints on:
  - users.email
  - users.phone
  - sessions.token
  - pages.slug
  - settings.key
  - course_enrollments(user_id, course_id)

## Cascading Deletes

- Sessions deleted when user is deleted
- Appointments deleted when patient/psychologist is deleted
- Course enrollments deleted when user/course is deleted
- Assessment results deleted when user/assessment is deleted
- Messages deleted when thread is deleted
- Support messages deleted when ticket is deleted

## Database Statistics

**Total Tables**: 14
**Total Relationships**: 15+ foreign keys
**Total Indexes**: 20+ (automatic + unique constraints)
**Sample Data Volume**:
- 4 users
- 2 sessions
- 1 appointment
- 1 course + 1 enrollment
- 1 message thread + 2 messages
- 1 page (about-us)
- 6 settings (contact info)

## Query Performance Considerations

### Optimized Queries
- Pagination on all list endpoints
- Index usage on foreign keys
- Efficient JOINs for related data

### JSONB Benefits
- Flexible schema for questions/answers
- No need for separate tables for dynamic content
- GIN indexes available if needed

### Array Usage
- Efficient participant storage in threads
- Native PostgreSQL array operations
- ANY() operator for member checks

## Backup & Restore

### Schema Only
```bash
pg_dump -d yektayar --schema-only > yektayar-schema.sql
```

### Full Backup
```bash
pg_dump -d yektayar > yektayar-full-dump.sql
```

### Restore
```bash
psql -d yektayar < yektayar-full-dump.sql
```

## Database Size

Current size: ~440 KB total
- users: 64 KB (largest)
- settings: 48 KB
- pages: 48 KB
- sessions: 48 KB
- Others: 8-40 KB each

## Connection String

```
postgresql://yektayar_user:yektayar_dev_password@localhost:5432/yektayar
```

## Future Considerations

### Performance Optimization
- Add GIN indexes for JSONB columns
- Add partial indexes for common filters
- Consider materialized views for statistics

### Data Growth
- Implement session cleanup job
- Archive old appointments
- Implement soft deletes for audit trail

### Scaling
- Read replicas for reporting
- Connection pooling (pgBouncer)
- Partitioning for large tables (messages, sessions)
