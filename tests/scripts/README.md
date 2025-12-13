# Test Scripts

This directory contains test scripts for various components and features of the YektaYar platform.

## Usage

Most test scripts can be run directly or via npm scripts defined in the root `package.json`.

## Available Test Scripts

### SMS & OTP Tests

#### `test-all-sms.ts`
Comprehensive test suite for all SMS functions including pattern SMS, regular SMS, VOTP, and balance checking.

**Usage:**
```bash
bun tests/scripts/test-all-sms.ts
```

#### `test-balance-credit.ts`
Tests SMS credit balance checking functionality across different API formats.

**Usage:**
```bash
bun tests/scripts/test-balance-credit.ts
```

#### `test-pattern-otp.ts`
Tests pattern-based OTP sending functionality.

**Usage:**
```bash
bun tests/scripts/test-pattern-otp.ts
```

#### `test-sms-extended.ts`
Extended SMS testing including VOTP (Voice OTP) and various SMS formats.

**Usage:**
```bash
bun tests/scripts/test-sms-extended.ts
```

#### `test-sms-functions.ts`
Unit tests for individual SMS service functions.

**Usage:**
```bash
bun tests/scripts/test-sms-functions.ts
```

#### `test-edge-pattern.js`
Tests IPPanel Edge API pattern sending.

**Usage:**
```bash
node tests/scripts/test-edge-pattern.js
```

#### `test-integration-complete.ts`
Complete integration test for all SMS features.

**Usage:**
```bash
bun tests/scripts/test-integration-complete.ts
```

#### `test-final-all-apis.ts`
Final validation of all SMS API endpoints.

**Usage:**
```bash
bun tests/scripts/test-final-all-apis.ts
```

#### `test-rest-api-v1.ts`
REST API v1 endpoint testing.

**Usage:**
```bash
bun tests/scripts/test-rest-api-v1.ts
```

**Note:** For user-facing SMS testing, use the main test script: `bun scripts/test-sms.ts [phone] [options]`

See [docs/guides/SMS-OTP-INTEGRATION.md](../../docs/guides/SMS-OTP-INTEGRATION.md) for full SMS documentation.

### Database & API Tests

#### `test-health-db.cjs`
Manual test script for the `/health/db` endpoint.

**Usage:**
```bash
node tests/scripts/test-health-db.cjs [base-url]

# Examples:
node tests/scripts/test-health-db.cjs
node tests/scripts/test-health-db.cjs http://localhost:3000
```

#### `test-websocket.mjs`
WebSocket connection test utility.

**Usage:**
```bash
node tests/scripts/test-websocket.mjs
# or via npm:
npm run test:websocket
```

#### `test-socketio.sh`
Interactive TUI for testing Socket.IO connectivity and functionality.

**Usage:**
```bash
./tests/scripts/test-socketio.sh [backend-url]

# Examples:
./tests/scripts/test-socketio.sh
./tests/scripts/test-socketio.sh http://localhost:3000
```

See [docs/api/README-SOCKETIO-TUI.md](../../docs/api/README-SOCKETIO-TUI.md) for full documentation.

### Dependency Tests

#### `test-dependencies.cjs`
Verify dependency compatibility across workspaces.

**Usage:**
```bash
node tests/scripts/test-dependencies.cjs
# or via npm:
npm run test:deps
```

### Backend Tests

#### `test-backend-fix.sh`
Automated test script for backend fixes.

**Usage:**
```bash
./tests/scripts/test-backend-fix.sh
```

### Development Runner Tests

#### `test-dev-runner.sh`
Test suite for the development runner script.

**Usage:**
```bash
./tests/scripts/test-dev-runner.sh
```

#### `test-process-tree-kill.sh`
Test process tree killing functionality.

**Usage:**
```bash
./tests/scripts/test-process-tree-kill.sh
```

#### `test-port-checking.sh`
Test port checking functionality.

**Usage:**
```bash
./tests/scripts/test-port-checking.sh
```

#### `test-vite-simulation.sh`
Simulate Vite/ESBuild behavior for testing.

**Usage:**
```bash
./tests/scripts/test-vite-simulation.sh
```

#### `test-real-vite-scenario.sh`
Test real Vite scenarios.

**Usage:**
```bash
./tests/scripts/test-real-vite-scenario.sh
```

### Bash Feature Tests

#### `test-bashrc-features.sh`
Automated test suite for bashrc enhancement scripts.

**Usage:**
```bash
./tests/scripts/test-bashrc-features.sh
```

#### `test-help-colors.sh`
Test help message color output.

**Usage:**
```bash
./tests/scripts/test-help-colors.sh
```

## Notes

- Test scripts with `.cjs` extension are CommonJS modules
- Test scripts with `.sh` extension are Bash scripts (requires Bash shell)
- Some tests require specific services to be running (e.g., backend, database)
- Check individual script files for detailed usage and requirements

## Related Documentation

- [API Testing Documentation](../../docs/api/)
- [Implementation Documentation](../../docs/implementation/)
- [Troubleshooting Guide](../../docs/troubleshooting/)
