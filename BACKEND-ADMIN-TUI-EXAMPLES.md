# Backend Administration TUI - Screenshots & Examples

This document provides visual examples of the Backend Administration TUI in action.

## Initial Screen

When you run `npm run admin:tui`, you'll see:

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        Backend Administration TUI                             ║
║        YektaYar Platform                                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

ℹ️ Backend Administration TUI
ℹ️ Direct database access - no REST API required


✨ ═══ Database Connection Status ═══
✅ Database connection is healthy
Server time: 11/15/2025, 9:08:21 AM
PostgreSQL: PostgreSQL 15.3
Database size: 42 MB


✨ ═══ Available Actions ═══

Session Management:
  1 - List all sessions
  2 - List active sessions
  3 - List expired sessions
  4 - List logged-in sessions
  5 - View session details
  6 - Delete session
  7 - Cleanup expired sessions
  8 - Session statistics

User Management:
  9 - List users
  10 - View user details

System:
  11 - Database connection status
  12 - System health check

  h - Show this menu
  q - Quit

Enter command (h for help):
```

## Example: List Active Sessions (Command 2)

```
✨ ═══ Sessions List (active) ═══
Found 15 session(s)

ID     Token                User ID  Logged In  Created              Status    
────────────────────────────────────────────────────────────────────────────────────────────────────────
1      a8f7b2c3d4e5f6g7..   123      ✓          2 hours ago          ✅ Active
2      h8i9j0k1l2m3n4o5..   N/A      ✗          3 hours ago          ✅ Active
3      p6q7r8s9t0u1v2w3..   456      ✓          1 day ago            ✅ Active
4      x4y5z6a7b8c9d0e1..   N/A      ✗          5 minutes ago        ✅ Active
5      f2g3h4i5j6k7l8m9..   789      ✓          2 days ago           ✅ Active
```

## Example: Session Details (Command 5)

```
✨ ═══ Session Details ═══

Session ID: 1
Token: a8f7b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
Status: ✅ Active
Logged In: ✓ Yes

User Information:
  ID: 123
  Name: Ali Ahmadi
  Email: ali@example.com
  Type: patient

Timestamps:
  Created: 11/15/2025, 7:08:21 AM (2 hours ago)
  Expires: 12/15/2025, 9:08:21 AM
  Last Activity: 11/15/2025, 9:05:43 AM (3 minutes ago)

Metadata:
{
  "userAgent": "Mozilla/5.0 ...",
  "ip": "192.168.1.100",
  "deviceInfo": {
    "platform": "Android",
    "mobile": true
  }
}
```

## Example: Session Statistics (Command 8)

```
✨ ═══ Session Statistics ═══

Overview:
  Total Sessions: 127
  Active: 45
  Expired: 82

Active Sessions Breakdown:
  Logged In: 23
  Anonymous: 22

Recent Activity:
  Created Today: 12
  Created This Week: 58
```

## Example: List Users (Command 9)

```
✨ ═══ Users List ═══
Found 25 user(s)

ID     Name                      Email                          Type            Active  
────────────────────────────────────────────────────────────────────────────────────────────────────────
1      Admin User                admin@yektayar.com             admin           ✅ Yes
2      Dr. Sara Mohammadi        psychologist@yektayar.com      psychologist    ✅ Yes
3      Ali Ahmadi                patient@yektayar.com           patient         ✅ Yes
4      Maryam Rezaei            maryam.rezaei@example.com      patient         ✅ Yes
5      Dr. Hassan Karimi        hassan.karimi@example.com      psychologist    ✅ Yes
```

## Example: User Details (Command 10)

```
✨ ═══ User Details ═══

User ID: 2
Name: Dr. Sara Mohammadi
Email: psychologist@yektayar.com
Phone: +98 912 345 6789
Type: psychologist
Active: ✅ Yes

Bio: Licensed Clinical Psychologist with 10 years of experience in cognitive behavioral therapy and family counseling.

Specialization: Cognitive Behavioral Therapy, Family Counseling, Anxiety Disorders

Timestamps:
  Created: 10/15/2025, 10:30:00 AM
  Updated: 11/14/2025, 3:45:22 PM

Active Sessions: 2
```

## Example: System Health Check (Command 12)

```
✨ ═══ System Health ═══
✅ Database tables: 15
appointments, assessment_results, assessments, course_enrollments, courses, message_threads, messages, pages, sessions, settings, support_messages, support_tickets, user_preferences, users

Records:
  Users: 25
  Sessions: 127
  Appointments: 84
  Courses: 12

⚠️ 82 expired sessions need cleanup

✅ System is healthy
```

## Example: Cleanup Expired Sessions (Command 7)

```
✨ ═══ Cleanup Expired Sessions ═══
⏳ Cleaning up expired sessions...
✅ Cleaned up 82 expired session(s)
```

## Example: Delete Session (Command 6)

```
✨ ═══ Delete Session ═══
Are you sure you want to delete session 42? (yes/no): yes
✅ Session 42 deleted successfully
```

## Color Coding

The TUI uses ANSI color codes for better readability:

- 🔵 **Cyan**: Headers and informational messages
- 🟢 **Green**: Success messages and active states
- 🔴 **Red**: Errors and expired/inactive states
- 🟡 **Yellow**: Warnings and caution messages
- ⚪ **White/Dim**: Regular text and secondary information
- 🟣 **Magenta/Bright**: Important values and highlights

## Emojis Used

- ✅ Success/Active status
- ❌ Error/Expired status
- ℹ️ Information
- ⚠️ Warning
- ⏳ In progress
- ✨ Section headers
- 🔧 Tools/Settings
- 📊 Statistics
- 💾 Database
- 👥 Users
- 🔑 Sessions
- 🏥 Health

## Navigation

- **Number keys (1-12)**: Execute commands
- **h**: Show help menu
- **q**: Quit application
- **Ctrl+C**: Emergency exit with cleanup

## Error Handling Examples

### Database Connection Error
```
❌ ERROR: Failed to connect to database
Connection refused at localhost:5432
ℹ️ Please check your DATABASE_URL environment variable
```

### Session Not Found
```
❌ ERROR: Session not found
⚠️ Session not found or already deleted
```

### Invalid Input
```
⚠️ Unknown command. Type "h" for help.
```

## Use Cases

### Daily Session Cleanup
1. Run `npm run admin:tui`
2. Enter `7` (Cleanup expired sessions)
3. Verify with `8` (Session statistics)

### User Investigation
1. Run `npm run admin:tui`
2. Enter `9` (List users)
3. Note user ID
4. Enter `10` and provide user ID
5. Review user details and active sessions

### Session Monitoring
1. Run `npm run admin:tui`
2. Enter `2` (List active sessions)
3. Review suspicious sessions
4. Enter `5` and provide session ID for details
5. Enter `6` to delete if necessary

### Health Check Routine
1. Run `npm run admin:tui`
2. Enter `12` (System health check)
3. Review warnings
4. Address issues (e.g., run cleanup if suggested)

## Best Practices

1. **Regular Monitoring**: Check active sessions daily
2. **Scheduled Cleanup**: Run session cleanup at least weekly
3. **User Verification**: Review new users regularly
4. **Health Checks**: Run system health before major operations
5. **Documentation**: Keep track of administrative actions

## Troubleshooting

See [BACKEND-ADMIN-TUI.md](BACKEND-ADMIN-TUI.md#troubleshooting) for detailed troubleshooting guide.

## See Also

- [Backend Administration TUI Guide](BACKEND-ADMIN-TUI.md) - Complete documentation
- [Development Guide](DEVELOPMENT.md) - Developer information
- [README](README.md) - Project overview
