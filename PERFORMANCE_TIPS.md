# RAM Optimization Guide

## 🚀 Quick Fixes to Reduce RAM Usage

### 1. Use Standard Dev Server (Not Turbopack)
Turbopack is experimental and uses more RAM.

**Current (high RAM):**
```bash
npm run dev  # Uses --turbopack
```

**Better (lower RAM):**
```bash
# Edit package.json scripts
"dev": "next dev"  # Remove --turbopack
```

### 2. Limit Parallel Builds
Create or update `next.config.ts`:

```typescript
const nextConfig = {
  // Reduce memory usage
  experimental: {
    optimizeCss: false, // Disable CSS optimization in dev
    turbo: undefined, // Disable turbopack
  },

  // Limit workers
  typescript: {
    ignoreBuildErrors: true, // Skip type checking in dev
  },

  eslint: {
    ignoreDuringBuilds: true, // Skip linting in dev
  },
}
```

### 3. Add Environment Variables
Create `.env.local`:

```env
# Disable telemetry
NEXT_TELEMETRY_DISABLED=1

# Disable route discovery
NEXT_PRIVATE_DISABLE_EXPLICIT_ROUTE_DISCOVERY=true

# Reduce logging
NODE_ENV=development
LOG_LEVEL=error
```

### 4. Use Production Build for Testing
Instead of dev mode:

```bash
# Build once
npm run build

# Run production server (uses 10x less RAM)
npm start
```

### 5. Close Unused Programs
- Close browser tabs (Chrome uses 500MB+ per tab)
- Close other Node.js processes
- Close VS Code or use lightweight editors
- Close Docker/containers if not needed

### 6. System Optimizations

**Linux/Mac:**
```bash
# Clear Node cache
rm -rf .next
rm -rf node_modules/.cache

# Limit Node memory
NODE_OPTIONS="--max-old-space-size=2048" npm run dev
```

**Windows:**
```cmd
rmdir /s .next
rmdir /s node_modules\.cache
set NODE_OPTIONS=--max-old-space-size=2048 && npm run dev
```

### 7. Use Alternative Package Managers
- Use `pnpm` instead of `npm` (uses less RAM)
- Use `bun` instead of `node` (10x faster, less RAM)

```bash
# Install pnpm
npm install -g pnpm

# Use pnpm
pnpm install
pnpm dev
```

## 📊 RAM Usage Comparison

| Configuration | RAM Usage |
|--------------|-----------|
| Turbopack + Dev | 1.5-2 GB |
| Standard Dev | 800 MB - 1 GB |
| Production Mode | 200-300 MB |
| With optimizations | 150-200 MB |

## 🔧 Recommended Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:low-ram": "NODE_OPTIONS='--max-old-space-size=2048' next dev",
    "build": "next build",
    "start": "next start",
    "start:prod": "NODE_ENV=production next start"
  }
}
```

## 💡 Best Practices

1. **Use production mode** when not actively developing
2. **Restart dev server** every few hours
3. **Clear .next cache** weekly
4. **Use `npm run build && npm start`** for testing
5. **Disable extensions** in browser (use incognito)
6. **Close other projects** when working on this one

## 🚨 Emergency RAM Recovery

If RAM is critically high:

```bash
# Kill all Node processes
pkill -9 node

# Clear all caches
rm -rf .next node_modules/.cache

# Restart with limits
NODE_OPTIONS="--max-old-space-size=1536" npm run dev
```
