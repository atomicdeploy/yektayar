# PM2 Integration Guide

This guide explains how to use PM2 with the YektaYar development environment for professional process management.

## What is PM2?

PM2 is a production-grade process manager for Node.js applications. It provides:

- **Process Management**: Start, stop, restart, and monitor processes
- **Auto-restart**: Automatically restarts crashed processes
- **Load Balancing**: Can run multiple instances and balance load
- **Log Management**: Centralized logging with rotation
- **Monitoring**: Built-in monitoring dashboard
- **Startup Scripts**: Auto-start applications on system boot

## Installation

Install PM2 globally:

```bash
npm install -g pm2
```

## Usage with YektaYar

### Starting Services with PM2

```bash
# Start a single service
./scripts/dev-runner.sh backend --pm2
./scripts/dev-runner.sh admin --pm2
./scripts/dev-runner.sh mobile --pm2

# Start all services
./scripts/dev-runner.sh all --pm2
```

### Viewing Logs

```bash
# View all logs
pm2 logs

# View specific service logs
pm2 logs yektayar-backend
pm2 logs yektayar-admin
pm2 logs yektayar-mobile

# View logs with the dev-runner
./scripts/dev-runner.sh logs backend --pm2
./scripts/dev-runner.sh logs all --pm2
```

### Monitoring

```bash
# Show process list
pm2 list

# Show detailed monitoring
pm2 monit

# Show process details
pm2 show yektayar-backend
```

### Stopping Services

```bash
# Stop all YektaYar services
./scripts/dev-runner.sh stop --pm2

# Stop specific service
pm2 stop yektayar-backend

# Stop and remove from PM2
pm2 delete yektayar-backend
```

### Restarting Services

```bash
# Restart specific service
pm2 restart yektayar-backend

# Restart all services
pm2 restart all
```

## Native Mode vs PM2 Mode

### Native Mode (Default)

- **Use for**: Quick development, debugging, temporary testing
- **Pros**: Simple, no external dependencies, direct control
- **Cons**: No auto-restart, manual process management, basic logging
- **Command**: `./scripts/dev-runner.sh all --detached`

### PM2 Mode

- **Use for**: Long-running dev environments, production-like testing, team collaboration
- **Pros**: Auto-restart, better logging, monitoring, easier management
- **Cons**: Requires PM2 installation, additional complexity
- **Command**: `./scripts/dev-runner.sh all --pm2`

## Comparison Table

| Feature | Native Mode | PM2 Mode |
|---------|-------------|----------|
| Auto-restart on crash | ❌ | ✅ |
| Log rotation | ❌ | ✅ |
| Process monitoring | Basic | Advanced |
| Resource monitoring | ❌ | ✅ |
| Cluster mode | ❌ | ✅ |
| Startup scripts | ❌ | ✅ |
| Web dashboard | ❌ | ✅ (pm2-web) |
| Dependencies | None | PM2 |

## Advanced PM2 Features

### Save Process List

Save the current process list to be resurrected on reboot:

```bash
pm2 save
```

### Generate Startup Script

Generate a startup script to launch PM2 on system boot:

```bash
pm2 startup
# Follow the instructions provided
```

### Log Management

```bash
# Flush all logs
pm2 flush

# Reload all logs
pm2 reloadLogs
```

### Monitoring Dashboard

Install and use PM2's web-based monitoring:

```bash
pm2 install pm2-web
```

## Troubleshooting

### Services Not Starting

Check PM2 logs for errors:

```bash
pm2 logs yektayar-backend --lines 100
```

### Port Already in Use

Check if services are already running:

```bash
pm2 list
./scripts/dev-runner.sh status --pm2
```

Stop existing services:

```bash
./scripts/dev-runner.sh stop --pm2
```

### PM2 Not Found

Install PM2 globally:

```bash
npm install -g pm2
```

### Process Not Auto-Restarting

Check PM2 configuration:

```bash
pm2 show yektayar-backend
```

Look for `restarts` counter and `status`.

## Best Practices

1. **Use PM2 for Long-Running Dev Environments**: If you're running services for hours or days
2. **Use Native Mode for Quick Testing**: For short development sessions
3. **Regular Cleanup**: Periodically clean up PM2 processes with `pm2 delete all`
4. **Monitor Resources**: Use `pm2 monit` to watch resource usage
5. **Save Configuration**: Use `pm2 save` to preserve your process list

## Integration with Other Tools

### With Docker

PM2 can be used inside Docker containers for better process management:

```dockerfile
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

### With Systemd

PM2 can generate systemd service files:

```bash
pm2 startup systemd
```

### With Monitoring Services

PM2 can integrate with monitoring services like Keymetrics, New Relic, etc.

## Future Enhancements

Potential future improvements to the PM2 integration:

1. **Ecosystem File**: Create `ecosystem.config.js` for advanced configuration
2. **Cluster Mode**: Run multiple instances of backend for load testing
3. **Environment Management**: Different configs for dev/staging/prod
4. **Custom Metrics**: Add application-specific metrics
5. **Alert System**: Set up alerts for crashes or high resource usage

## References

- [PM2 Official Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 GitHub Repository](https://github.com/Unitech/pm2)
- [PM2 Process Management Guide](https://pm2.keymetrics.io/docs/usage/process-management/)
