# Docker Deployment Guide

This guide will help you deploy the updated Docker container with the fixed nginx configuration.

## What Was Fixed

- **Admin dashboard route** (`/maduadmin`) now works correctly
- **MIME type errors** resolved - JavaScript files are served with correct headers
- **SPA routing** properly configured in nginx
- All React Router routes now work as expected

---

## Quick Deploy (Production Server)

### Step 1: Push Changes to Git

```bash
git add Dockerfile nginx.conf .dockerignore
git commit -m "Fix nginx SPA routing and MIME type errors"
git push
```

### Step 2: On Your Production Server

```bash
# Pull the latest changes
git pull origin main

# Build the new Docker image
docker build -t lflauto-website:latest .

# Stop and remove the old container (adjust container name if needed)
docker stop lflauto-website
docker rm lflauto-website

# Run the new container
docker run -d \
  --name lflauto-website \
  -p 80:80 \
  --restart unless-stopped \
  lflauto-website:latest

# Check the logs
docker logs -f lflauto-website
```

### Step 3: Verify Deployment

Visit these URLs to confirm everything works:
- ✅ https://lflauto.co.uk (home page)
- ✅ https://lflauto.co.uk/about
- ✅ https://lflauto.co.uk/maduadmin (admin dashboard)

---

## Using Docker Compose (Recommended)

If you're using `docker-compose.yml`:

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### Sample docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: lflauto-website
    ports:
      - "80:80"
    restart: unless-stopped
    # Optional: Add environment variables
    # environment:
    #   - NODE_ENV=production
```

---

## Local Testing (Before Production Deploy)

### Test the Build Locally

```bash
# Start Docker Desktop (if on Mac/Windows)
# Then run:

# Build the image
docker build -t lflauto-website-test .

# Run locally on port 8080
docker run -d \
  --name lflauto-test \
  -p 8080:80 \
  lflauto-website-test

# Test in browser
open http://localhost:8080
open http://localhost:8080/maduadmin

# Check logs
docker logs lflauto-test

# Stop and remove when done
docker stop lflauto-test
docker rm lflauto-test
```

---

## Troubleshooting

### Check if container is running
```bash
docker ps
```

### View container logs
```bash
docker logs lflauto-website
# or follow logs in real-time
docker logs -f lflauto-website
```

### Restart container
```bash
docker restart lflauto-website
```

### Verify nginx configuration inside container
```bash
docker exec lflauto-website cat /etc/nginx/conf.d/default.conf
```

### Test nginx configuration
```bash
docker exec lflauto-website nginx -t
```

### Access container shell
```bash
docker exec -it lflauto-website sh
```

---

## Common Issues

### Issue: Old container still running
**Solution:**
```bash
docker stop lflauto-website
docker rm lflauto-website
# Then rebuild and run
```

### Issue: Port 80 already in use
**Solution:**
```bash
# Find what's using port 80
sudo lsof -i :80
# Or use a different port
docker run -d -p 8080:80 --name lflauto-website lflauto-website:latest
```

### Issue: Changes not reflected
**Solution:**
```bash
# Clear old images
docker system prune -a
# Rebuild with --no-cache
docker build --no-cache -t lflauto-website .
```

---

## Production Deployment Checklist

- [ ] Changes committed and pushed to git
- [ ] Pull latest changes on server
- [ ] Build new Docker image
- [ ] Stop old container
- [ ] Start new container
- [ ] Test main site: https://lflauto.co.uk
- [ ] Test admin dashboard: https://lflauto.co.uk/maduadmin
- [ ] Test other routes (/about, /portfolio, /gallery, /contact)
- [ ] Check Docker logs for errors
- [ ] Monitor for 5-10 minutes

---

## Security Reminder

Don't forget to change the admin password!

Set `VITE_ADMIN_PASSWORD` environment variable:

```bash
docker run -d \
  --name lflauto-website \
  -p 80:80 \
  -e VITE_ADMIN_PASSWORD=your_secure_password \
  --restart unless-stopped \
  lflauto-website:latest
```

Or in docker-compose.yml:
```yaml
environment:
  - VITE_ADMIN_PASSWORD=your_secure_password
```

**Note:** You'll need to rebuild the image for environment variables to take effect since this is a build-time variable.

---

## Build Performance

Your current bundle size is quite large (518 KB). Consider code-splitting for better performance:

### Optional: Optimize Bundle Size

Edit `vite.config.ts`:

```typescript
export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  },
  // ... rest of config
}));
```

This can be done later as an optimization.

---

## Need Help?

If you encounter issues:
1. Check Docker logs: `docker logs lflauto-website`
2. Verify nginx config: `docker exec lflauto-website nginx -t`
3. Check if container is healthy: `docker ps`
4. Review this guide's troubleshooting section
