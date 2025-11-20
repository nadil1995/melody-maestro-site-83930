# QUICK FIX - Admin Dashboard Not Loading

## The Problem
You're getting this error:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "text/html"
```

**Root Cause:** The old Docker container is still running with the old nginx configuration that doesn't support SPA routing.

---

## THE SOLUTION - Run on Your Production Server

### Option 1: Automated Script (Easiest) ⭐

```bash
# SSH into your production server
ssh user@lflauto.co.uk

# Navigate to project directory
cd /path/to/melody-maestro-site-83930

# Run the deployment script
./deploy.sh
```

That's it! The script will automatically:
- Pull latest changes
- Build new Docker image with fixed nginx config
- Stop old container
- Start new container
- Show you the logs

---

### Option 2: Manual Steps

If the script doesn't work, run these commands manually:

```bash
# 1. SSH into server
ssh user@lflauto.co.uk

# 2. Go to project directory
cd /path/to/melody-maestro-site-83930

# 3. Pull latest changes
git pull origin v1

# 4. Build new image
docker build -t lflauto-website:latest .

# 5. Stop old container
docker stop lflauto-website

# 6. Remove old container
docker rm lflauto-website

# 7. Start new container
docker run -d \
  --name lflauto-website \
  -p 80:80 \
  --restart unless-stopped \
  lflauto-website:latest

# 8. Check logs
docker logs -f lflauto-website
```

Press `Ctrl+C` to exit logs.

---

## Verify It's Fixed

After deployment, test these URLs in your browser:

1. **Main site:** https://lflauto.co.uk
   - Should load normally

2. **Admin dashboard:** https://lflauto.co.uk/maduadmin
   - Should show login screen (not 404!)
   - Password: `madu2025admin`

3. **Other pages:**
   - https://lflauto.co.uk/about
   - https://lflauto.co.uk/portfolio
   - https://lflauto.co.uk/gallery

All should work without errors!

---

## What Changed?

### Files Updated:
1. **nginx.conf** - New file with proper SPA routing
2. **Dockerfile** - Now copies nginx.conf into container
3. **deploy.sh** - Automated deployment script

### The Fix:
The nginx configuration now includes:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This tells nginx:
- First, try to serve the file directly (for JS/CSS/images)
- If file doesn't exist, serve index.html (for React routes like /maduadmin)

---

## Troubleshooting

### "Still seeing the error"
**Solution:** Hard refresh your browser
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Safari: `Cmd+Option+R` (Mac)

### "Container won't start"
**Solution:** Check logs
```bash
docker logs lflauto-website
```

### "deploy.sh not found"
**Solution:** Make sure you pulled the latest code
```bash
git pull origin v1
chmod +x deploy.sh
```

### "Permission denied on deploy.sh"
**Solution:** Make it executable
```bash
chmod +x deploy.sh
```

---

## Still Need Help?

If it's still not working:

1. **Check which container is running:**
   ```bash
   docker ps
   ```

2. **Check nginx config in container:**
   ```bash
   docker exec lflauto-website cat /etc/nginx/conf.d/default.conf
   ```
   You should see `try_files $uri $uri/ /index.html;`

3. **Test nginx config:**
   ```bash
   docker exec lflauto-website nginx -t
   ```

4. **Force rebuild (nuclear option):**
   ```bash
   docker stop lflauto-website
   docker rm lflauto-website
   docker rmi lflauto-website:latest
   docker build --no-cache -t lflauto-website:latest .
   docker run -d --name lflauto-website -p 80:80 --restart unless-stopped lflauto-website:latest
   ```

---

## Summary

**To fix the error:**
1. SSH to production server
2. Run `./deploy.sh`
3. Wait for deployment to complete
4. Test https://lflauto.co.uk/maduadmin

**That's it!** 🎉
