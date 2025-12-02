# Process Tree Management - Before and After

This document illustrates how the dev-runner.sh improvements fix the child process issue.

## Before (The Problem)

```
┌─────────────────────────────────────────────────────────┐
│ Terminal: ./scripts/dev-runner.sh all --detached       │
└─────────────────────────────────────────────────────────┘
                          ↓
                          ↓ spawns with nohup
                          ↓
┌─────────────────────────────────────────────────────────┐
│ npm run dev (PID: 1234)                                 │
│ [PID stored in /tmp/yektayar-admin.pid]                 │
└─────────────────────────────────────────────────────────┘
                          ↓
                          ↓ spawns
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
    ┌──────────────────┐    ┌──────────────────┐
    │ vite (PID: 1235) │    │ vite (PID: 1236) │
    │ [NOT TRACKED]    │    │ [NOT TRACKED]    │
    └──────────────────┘    └──────────────────┘
              ↓                       ↓
              ↓ spawns                ↓ spawns
              ↓                       ↓
    ┌──────────────────┐    ┌──────────────────┐
    │ esbuild (1237)   │    │ esbuild (1238)   │
    │ [NOT TRACKED]    │    │ [NOT TRACKED]    │
    └──────────────────┘    └──────────────────┘

                          ↓
            ./scripts/dev-runner.sh stop
                          ↓
                          ↓ kill PID 1234
                          ↓
    ┌──────────────────────────────────────────┐
    │ npm process killed                        │
    └──────────────────────────────────────────┘
              ↓
              ↓ BUT...
              ↓
    ┌──────────────────────────────────────────┐
    │ ❌ vite and esbuild processes SURVIVE    │
    │ ❌ Become orphaned (PPID = 1)            │
    │ ❌ Continue listening on ports           │
    │ ❌ App/Admin panel still accessible      │
    └──────────────────────────────────────────┘
```

## After (The Solution)

```
┌─────────────────────────────────────────────────────────┐
│ Terminal: ./scripts/dev-runner.sh all --detached       │
└─────────────────────────────────────────────────────────┘
                          ↓
                          ↓ spawns with setsid (NEW!)
                          ↓
┌─────────────────────────────────────────────────────────┐
│ npm run dev (PID: 1234, PGID: 1234)                    │
│ [PID stored in /tmp/yektayar-admin.pid]                 │
│ [Process group created with setsid]                     │
└─────────────────────────────────────────────────────────┘
                          ↓
                          ↓ spawns (same process group)
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
    ┌──────────────────┐    ┌──────────────────┐
    │ vite (PID: 1235) │    │ vite (PID: 1236) │
    │ PGID: 1234       │    │ PGID: 1234       │
    │ [TRACKED]        │    │ [TRACKED]        │
    └──────────────────┘    └──────────────────┘
              ↓                       ↓
              ↓ spawns                ↓ spawns
              ↓                       ↓
    ┌──────────────────┐    ┌──────────────────┐
    │ esbuild (1237)   │    │ esbuild (1238)   │
    │ PGID: 1234       │    │ PGID: 1234       │
    │ [TRACKED]        │    │ [TRACKED]        │
    └──────────────────┘    └──────────────────┘

                          ↓
            ./scripts/dev-runner.sh stop
                          ↓
                          ↓ kill_process_tree(1234)
                          ↓
    ┌──────────────────────────────────────────┐
    │ 1. Find children: pgrep -P 1234         │
    │    → 1235, 1236                          │
    │                                          │
    │ 2. Recursively kill children first      │
    │    → kill_process_tree(1235)            │
    │      → Find children: 1237              │
    │      → kill 1237 (SIGTERM)              │
    │      → kill 1235 (SIGTERM)              │
    │    → kill_process_tree(1236)            │
    │      → Find children: 1238              │
    │      → kill 1238 (SIGTERM)              │
    │      → kill 1236 (SIGTERM)              │
    │                                          │
    │ 3. Kill parent                           │
    │    → kill 1234 (SIGTERM)                │
    │                                          │
    │ 4. Wait up to 10 seconds                │
    │                                          │
    │ 5. If still alive: SIGKILL               │
    └──────────────────────────────────────────┘
              ↓
              ↓ Result
              ↓
    ┌──────────────────────────────────────────┐
    │ ✅ All processes terminated              │
    │ ✅ Process tree completely cleaned up   │
    │ ✅ Ports freed and verified              │
    │ ✅ No orphaned processes                 │
    │ ✅ App/Admin panel properly stopped      │
    └──────────────────────────────────────────┘
```

## Key Improvements

### 1. setsid Usage
```bash
# Before
nohup npm run dev > /tmp/log 2>&1 &

# After
setsid npm run dev > /tmp/log 2>&1 &
```
Creates a new process group, making all children trackable.

### 2. Recursive Killing
```bash
kill_process_tree() {
    local pid=$1
    local signal=${2:-TERM}
    
    # Get all child PIDs recursively
    local children=$(pgrep -P "$pid" 2>/dev/null)
    
    # Kill children first (depth-first)
    for child in $children; do
        kill_process_tree "$child" "$signal"
    done
    
    # Kill the parent
    if kill -0 "$pid" 2>/dev/null; then
        kill -"$signal" "$pid" 2>/dev/null || true
    fi
}
```

### 3. Port Verification
```bash
# Wait for port to be free after killing processes
if wait_for_port_free "$ADMIN_PORT" 5; then
    echo "✓ Port $ADMIN_PORT is now free"
else
    echo "⚠ Port $ADMIN_PORT may still be in use"
fi
```

## Execution Flow

### Starting Services
```
1. Load .env for port configuration
2. Check if port is already in use
3. Start with setsid to create process group
4. Store PID in /tmp/yektayar-{service}.pid
5. Wait for port to be listening (up to 30s)
6. Report success with port status
```

### Stopping Services
```
1. Read PID from file
2. Check if process is running
3. Call kill_process_tree() recursively:
   a. Find all children with pgrep -P
   b. Recursively kill each child
   c. Kill parent process
4. Wait for process to die (graceful, 10s)
5. If still alive, SIGKILL
6. Verify port is freed (up to 5s)
7. Clean up PID file
```

## PM2 Mode Alternative

```
┌─────────────────────────────────────────────────────────┐
│ Terminal: ./scripts/dev-runner.sh all --pm2            │
└─────────────────────────────────────────────────────────┘
                          ↓
                          ↓ Uses PM2 daemon
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PM2 Daemon (Always Running)                             │
│ - Manages all processes                                 │
│ - Auto-restart on crash                                 │
│ - Log rotation                                          │
│ - Monitoring                                            │
└─────────────────────────────────────────────────────────┘
                          ↓
              ┌───────────┴───────────────────┐
              ↓                               ↓
    ┌────────────────┐            ┌────────────────┐
    │ yektayar-admin │            │ yektayar-mobile│
    │ (PM2 managed)  │            │ (PM2 managed)  │
    └────────────────┘            └────────────────┘
              ↓                               ↓
    All child processes                All child processes
    properly managed                   properly managed
    by PM2                             by PM2

    Benefits:
    ✅ Professional process management
    ✅ Auto-restart on crash
    ✅ Better logging
    ✅ Monitoring dashboard
    ✅ Cluster mode support
```

## Testing the Fix

The `test-vite-simulation.sh` script proves the fix works by:

1. Creating a realistic npm → vite → esbuild process tree
2. Verifying all processes are running
3. Calling `dev-runner.sh stop`
4. Verifying ALL processes (including children) are killed
5. Confirming no orphaned processes remain

```bash
# Run the test
./tests/scripts/test-vite-simulation.sh

# Output shows:
# ✓ All processes in tree were killed!
# ✓ The vite/esbuild orphan issue is fixed!
```

## Port Status Tracking

```
Before Start:
┌──────────────────────────────────┐
│ Check: is_port_in_use(5173)?    │
│ → No: OK to start                │
│ → Yes: Warn user                 │
└──────────────────────────────────┘

After Start:
┌──────────────────────────────────┐
│ Wait: wait_for_port(5173, 30s)  │
│ → Success: Report listening      │
│ → Timeout: Warn may have failed  │
└──────────────────────────────────┘

After Stop:
┌──────────────────────────────────┐
│ Wait: wait_for_port_free(5173)  │
│ → Success: Port freed             │
│ → Timeout: Warn still in use     │
└──────────────────────────────────┘
```

## Comparison: Native vs PM2

| Aspect | Native Mode | PM2 Mode |
|--------|-------------|----------|
| Process Tracking | Manual (PID files) | PM2 daemon |
| Child Process Handling | kill_process_tree() | PM2 handles it |
| Auto-restart | ❌ | ✅ |
| Monitoring | Basic (status command) | Advanced (pm2 monit) |
| Logs | Simple files | Rotated, managed |
| Complexity | Simple | Requires PM2 |
| Use Case | Quick dev | Long-running dev |

## Future Enhancements

Potential improvements to consider:

1. **Systemd Integration** - For production deployments
2. **Health Checks** - Verify services are actually responding
3. **Cluster Mode** - Run multiple instances for load testing  
4. **Graceful Reload** - Zero-downtime restarts
5. **Resource Limits** - CPU/memory constraints
6. **Alert System** - Notifications on crashes
