# Dev Runner Improvements Summary

This document summarizes the improvements made to `scripts/dev-runner.sh` to fix the process tree killing issue and add PM2 support.

## Problem Statement

When `./scripts/dev-runner.sh stop all` was invoked, even though the spawned process was killed, the app and admin panel remained operational because child processes (vite and esbuild) were not terminated:

```
node /path/to/node_modules/.bin/vite
/path/to/node_modules/@esbuild/linux-x64/bin/esbuild --service=0.25.12 --ping
```

## Root Cause

The script was only storing and killing the immediate parent PID (npm/bun process). When this parent was killed, its children (vite, esbuild) were orphaned and continued running.

## Solutions Implemented

### 1. Process Tree Killing

**Implementation:**
- Use `setsid` when starting processes to create a new process group
- Implement recursive `kill_process_tree()` function that:
  - Finds all child PIDs recursively using `pgrep -P`
  - Kills children first (depth-first traversal)
  - Then kills the parent process
  - Supports both SIGTERM (graceful) and SIGKILL (force)

**Code:**
```bash
kill_process_tree() {
    local pid=$1
    local signal=${2:-TERM}
    
    # Get all child PIDs recursively
    local children=$(pgrep -P "$pid" 2>/dev/null)
    
    # Kill children first
    for child in $children; do
        kill_process_tree "$child" "$signal"
    done
    
    # Kill the parent process
    if kill -0 "$pid" 2>/dev/null; then
        kill -"$signal" "$pid" 2>/dev/null || true
    fi
}
```

### 2. Port Checking

**Implementation:**
- `is_port_in_use()`: Check if a port is currently being listened on
- `wait_for_port()`: Wait for a service to start listening (with timeout)
- `wait_for_port_free()`: Wait for a port to be freed after stopping (with timeout)
- `cleanup_port()`: Find and kill orphaned processes on a specific port

**Features:**
- Supports multiple tools: `ss`, `netstat`, `lsof`, or TCP connection test
- Warns if port is already in use before starting
- Verifies port is freed after stopping
- Reports port status in stop output

### 3. Force Kill Flag

**Usage:**
```bash
./scripts/dev-runner.sh stop --force
```

**Behavior:**
- Skips graceful shutdown (SIGTERM)
- Immediately sends SIGKILL to entire process tree
- Faster but doesn't allow processes to clean up

### 4. PM2 Integration

**Installation:**
```bash
npm install -g pm2
```

**Usage:**
```bash
# Start with PM2
./scripts/dev-runner.sh all --pm2
./scripts/dev-runner.sh backend --pm2

# View logs
./scripts/dev-runner.sh logs backend --pm2
pm2 logs yektayar-backend

# Stop
./scripts/dev-runner.sh stop --pm2

# Monitor
pm2 monit
pm2 list
```

**Benefits:**
- Auto-restart on crash
- Better log management with rotation
- Process monitoring dashboard
- Startup scripts for auto-start on boot
- Cluster mode support
- Professional production-ready process management

**Configuration:**
- `ecosystem.config.js` provides advanced PM2 configuration
- See `docs/PM2-INTEGRATION.md` for complete guide

### 5. Status Command

**Usage:**
```bash
./scripts/dev-runner.sh status
```

**Output:**
- Shows each service's status (running/not running)
- Displays PID if running
- Shows port status (listening/not listening/in use by another process)
- Detects stale PID files

**Example:**
```
=== Services Status ===

Backend (Port 3000):
  PID: 12345 - Running ✓
  Port 3000: Listening ✓

Admin Panel (Port 5173):
  Not running
  Port 5173: In use by another process ⚠

Mobile App (Port 8100):
  Not running
```

### 6. Enhanced Start Process

**Features:**
- Loads port configuration from `.env` file
- Checks if port is already in use before starting
- Uses `setsid` to create proper process group
- Waits for service to be listening on expected port (with timeout)
- Reports success/warning based on port detection
- Shows clear instructions for viewing logs and status

### 7. Better Error Handling

**Features:**
- Detects stale PID files (PID file exists but process is dead)
- Finds and kills orphaned processes
- Provides helpful warnings and suggestions
- Graceful degradation if tools like `ss`/`netstat` not available

## Test Coverage

### 1. `test-dev-runner.sh` (Existing)
- Tests basic stop/start/logs functionality
- Tests help output and colorization
- Tests stale PID file handling

### 2. `test-process-tree-kill.sh` (New)
- Tests process tree killing with nested children
- Tests force kill flag
- Tests status command

### 3. `test-port-checking.sh` (New)
- Tests port detection functionality
- Tests stop command port verification
- Tests status command port information

### 4. `test-vite-simulation.sh` (New)
- Simulates realistic npm -> vite -> esbuild process tree
- Verifies all processes are killed (not just parent)
- Proves the original bug is fixed

## Backward Compatibility

All existing functionality is preserved:
- Old commands still work the same way
- No breaking changes to existing scripts
- New features are opt-in (flags)

## Usage Examples

### Native Mode (Default)

```bash
# Start services
./scripts/dev-runner.sh all --detached

# Check status
./scripts/dev-runner.sh status

# View logs
./scripts/dev-runner.sh logs all

# Stop gracefully
./scripts/dev-runner.sh stop

# Force stop
./scripts/dev-runner.sh stop --force
```

### PM2 Mode

```bash
# Start with PM2
./scripts/dev-runner.sh all --pm2

# Check status
./scripts/dev-runner.sh status --pm2
pm2 list

# View logs
./scripts/dev-runner.sh logs --pm2
pm2 logs

# Stop
./scripts/dev-runner.sh stop --pm2
```

## Files Changed/Added

### Modified
- `scripts/dev-runner.sh` - Main script with all improvements

### Added
- `tests/scripts/test-process-tree-kill.sh` - Process tree killing tests
- `tests/scripts/test-port-checking.sh` - Port checking tests
- `tests/scripts/test-vite-simulation.sh` - Vite/ESBuild simulation test
- `docs/PM2-INTEGRATION.md` - Complete PM2 integration guide
- `docs/DEV-RUNNER-IMPROVEMENTS.md` - This document
- `ecosystem.config.js` - PM2 ecosystem configuration
- `logs/.gitkeep` - Logs directory structure

## Performance Impact

- Minimal overhead for process tree traversal
- Port checking adds ~1-2 seconds to start/stop operations
- PM2 mode has slightly higher memory overhead but better reliability

## Future Enhancements

Potential future improvements:
1. Add cluster mode support for load testing
2. Implement custom metrics and monitoring
3. Add alert system for crashes/high resource usage
4. Create web dashboard for service management
5. Add support for other process managers (systemd, etc.)
6. Implement health check endpoints

## References

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Process Groups in Unix](https://en.wikipedia.org/wiki/Process_group)
- [Bash Process Management](https://www.gnu.org/software/bash/manual/html_node/Job-Control.html)
