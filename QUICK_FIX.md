# QUICK FIX - Admin Dashboard Not Loading

## The Problem
You're getting this error:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "text/html"
```

**Root Cause:** The old Docker container is still running with the old nginx configuration that doesn't support SPA routing.

---

## THE SOLUTION - Using Jenkins (Your Setup) ⭐

### Option 1: Trigger Jenkins Build (Easiest)

Since you're using Jenkins for CI/CD, simply trigger a new build:

1. **Push the changes** (already done ✅):
   ```bash
   # Changes are already pushed to v1 branch
   git log --oneline -5
   ```

2. **Trigger Jenkins pipeline:**
   - Go to your Jenkins dashboard
   - Find your pipeline job
   - Click **"Build Now"**
   - Or if you have a webhook, just push any change

3. **Jenkins will automatically:**
   - ✅ Pull latest code from `v1` branch
   - ✅ Build the Docker image with the **new nginx.conf**
   - ✅ Push to Docker Hub (`nadil95/lashiweb:latest`)
   - ✅ Deploy to EC2 (13.134.139.151)
   - ✅ Stop old container and start new one

---

### Option 2: Manual Deployment on EC2

If you want to deploy manually on your EC2 server:

```bash
# SSH into EC2
ssh ubuntu@13.134.139.151

# Stop old container
sudo docker stop geoapp
sudo docker rm geoapp

# Pull latest image (with nginx fix)
sudo docker pull nadil95/lashiweb:latest

# Start new container
sudo docker run -d -p 8081:80 --name geoapp nadil95/lashiweb:latest

# Check logs
sudo docker logs -f geoapp
```

Press `Ctrl+C` to exit logs.

---

## Verify It's Fixed

After deployment, test these URLs in your browser:

1. **Main site:** http://13.134.139.151:8081
   - Should load normally

2. **Admin dashboard:** http://13.134.139.151:8081/maduadmin
   - Should show login screen (not 404!)
   - Password: `madu2025admin`

3. **Other pages:**
   - http://13.134.139.151:8081/about
   - http://13.134.139.151:8081/portfolio
   - http://13.134.139.151:8081/gallery

Or if you have a domain pointing to the EC2:
- https://lflauto.co.uk/maduadmin

All should work without MIME type errors!

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
**Solution:** Check logs on EC2
```bash
ssh ubuntu@13.134.139.151
sudo docker logs geoapp
```

### "Jenkins build failed"
**Solution:** Check Jenkins console output for specific errors

### "Image not pulling on EC2"
**Solution:**
```bash
ssh ubuntu@13.134.139.151
sudo docker pull nadil95/lashiweb:latest
```

---

## Still Need Help?

If it's still not working, SSH into EC2:

```bash
ssh ubuntu@13.134.139.151
```

1. **Check which container is running:**
   ```bash
   sudo docker ps
   ```

2. **Check nginx config in container:**
   ```bash
   sudo docker exec geoapp cat /etc/nginx/conf.d/default.conf
   ```
   You should see `try_files $uri $uri/ /index.html;`

3. **Test nginx config:**
   ```bash
   sudo docker exec geoapp nginx -t
   ```

4. **Force redeploy via Jenkins:**
   - Trigger a new build in Jenkins
   - Or manually pull and restart:
   ```bash
   sudo docker stop geoapp
   sudo docker rm geoapp
   sudo docker pull nadil95/lashiweb:latest
   sudo docker run -d -p 8081:80 --name geoapp nadil95/lashiweb:latest
   ```

---

## Summary

**To fix the error:**
1. Go to your Jenkins dashboard
2. Click "Build Now" on your pipeline
3. Wait for deployment to complete
4. Test http://13.134.139.151:8081/maduadmin (or your domain)

**OR manually deploy:**
1. SSH to EC2: `ssh ubuntu@13.134.139.151`
2. Pull new image: `sudo docker pull nadil95/lashiweb:latest`
3. Restart container (see commands above)

**That's it!** 🎉
