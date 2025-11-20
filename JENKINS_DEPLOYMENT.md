# Jenkins CI/CD Deployment Guide

This project uses Jenkins to automatically build and deploy the application to AWS EC2.

## Current Setup

- **Jenkins Pipeline:** Automated CI/CD
- **Docker Hub:** `nadil95/lashiweb:latest`
- **EC2 Server:** `13.134.139.151`
- **Container Name:** `geoapp`
- **Port:** `8081` (mapped to container port 80)
- **Git Branch:** `v1`

---

## How It Works

### Pipeline Flow

1. **Checkout Code** - Pull latest from `v1` branch
2. **Install Dependencies** - Run `npm install`
3. **Build React App** - Run `npm run build`
4. **Build Docker Image** - Build with Dockerfile (includes nginx.conf)
5. **Push to Docker Hub** - Push `nadil95/lashiweb:latest`
6. **Deploy to EC2** - SSH to EC2, stop old container, start new one

---

## Triggering a Deployment

### Method 1: Automatic (Webhook)
If you have a GitHub webhook configured:
```bash
git add .
git commit -m "Your changes"
git push origin v1
```
Jenkins will automatically detect the push and start building.

### Method 2: Manual (Jenkins Dashboard)
1. Open Jenkins dashboard
2. Find your pipeline job
3. Click **"Build Now"**
4. Monitor the build progress

---

## What's Been Fixed

The nginx configuration has been updated to support SPA routing:

### Files Modified:
1. **nginx.conf** (NEW) - Custom nginx config with SPA routing
2. **Dockerfile** - Now copies nginx.conf into the container
3. **Jenkinsfile** - Already configured to build with these files

### The Fix:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This ensures:
- Static files (JS, CSS) are served correctly
- React Router routes like `/maduadmin` work properly
- No more MIME type errors

---

## Verifying Deployment

After Jenkins finishes:

### Check Jenkins Console
1. Go to your pipeline job
2. Click on the build number
3. Click "Console Output"
4. Look for: `✅ Deployment completed successfully!`

### Test the URLs

Replace `13.134.139.151:8081` with your domain if applicable:

- ✅ Main site: http://13.134.139.151:8081
- ✅ Admin dashboard: http://13.134.139.151:8081/maduadmin
- ✅ About page: http://13.134.139.151:8081/about
- ✅ Portfolio: http://13.134.139.151:8081/portfolio
- ✅ Gallery: http://13.134.139.151:8081/gallery

### Check Container on EC2

```bash
ssh ubuntu@13.134.139.151

# Check if container is running
sudo docker ps | grep geoapp

# Check logs
sudo docker logs geoapp

# Check nginx config (should show try_files)
sudo docker exec geoapp cat /etc/nginx/conf.d/default.conf
```

---

## Manual Deployment (Without Jenkins)

If you need to deploy manually:

```bash
# SSH to EC2
ssh ubuntu@13.134.139.151

# Stop old container
sudo docker stop geoapp
sudo docker rm geoapp

# Pull latest image
sudo docker pull nadil95/lashiweb:latest

# Start new container
sudo docker run -d \
  -p 8081:80 \
  --name geoapp \
  --restart unless-stopped \
  nadil95/lashiweb:latest

# Check logs
sudo docker logs -f geoapp
```

---

## Troubleshooting

### Build Fails at Docker Build Stage

**Issue:** Docker build fails
**Solution:**
- Check Dockerfile syntax
- Ensure nginx.conf exists in repo
- Check Jenkins console output for specific errors

### Image Won't Push to Docker Hub

**Issue:** Authentication error
**Solution:**
- Verify Docker Hub credentials in Jenkins
- Credentials ID should be: `dockerhub`
- Re-authenticate in Jenkins credentials

### Container Won't Start on EC2

**Issue:** Container exits immediately
**Solution:**
```bash
ssh ubuntu@13.134.139.151
sudo docker logs geoapp
```
Check for nginx config errors or port conflicts.

### Old Container Still Running

**Issue:** New container not replacing old one
**Solution:**
```bash
ssh ubuntu@13.134.139.151

# Force stop and remove
sudo docker stop geoapp
sudo docker rm geoapp

# Check no other containers using port 8081
sudo docker ps -a

# Restart deployment
# Trigger Jenkins build again
```

### Port 8081 Already in Use

**Issue:** Port conflict
**Solution:**
```bash
ssh ubuntu@13.134.139.151

# Find what's using the port
sudo lsof -i :8081

# Or check all running containers
sudo docker ps
```

### MIME Type Error Still Happening

**Issue:** Still getting JavaScript module error
**Solution:**
1. Verify nginx.conf is in the Docker image:
   ```bash
   sudo docker exec geoapp cat /etc/nginx/conf.d/default.conf
   ```
   Should show `try_files $uri $uri/ /index.html;`

2. If not present, rebuild:
   - Trigger new Jenkins build
   - Jenkins will rebuild with latest Dockerfile

3. Clear browser cache:
   - Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`

---

## Jenkins Pipeline Configuration

Your current Jenkinsfile is configured with:

```groovy
environment {
    DOCKER_IMAGE = "nadil95/lashiweb:latest"
    EC2_HOST = "13.134.139.151"
    SSH_CREDENTIALS = "geo-ssh"
}
```

### Required Jenkins Credentials:

1. **dockerhub** (Username/Password)
   - Docker Hub username
   - Docker Hub password or access token

2. **geo-ssh** (SSH Username with private key)
   - SSH private key for EC2
   - Username: `ubuntu`

---

## Monitoring

### View Logs in Real-Time

```bash
ssh ubuntu@13.134.139.151
sudo docker logs -f geoapp
```

### Check Container Health

```bash
ssh ubuntu@13.134.139.151
sudo docker ps
sudo docker inspect geoapp
```

### Check nginx Access Logs

```bash
ssh ubuntu@13.134.139.151
sudo docker exec geoapp cat /var/log/nginx/access.log
sudo docker exec geoapp cat /var/log/nginx/error.log
```

---

## Rollback

If the new deployment has issues:

```bash
ssh ubuntu@13.134.139.151

# Stop current container
sudo docker stop geoapp
sudo docker rm geoapp

# Pull a specific older version (if tagged)
sudo docker pull nadil95/lashiweb:previous-tag

# Or re-pull latest (if someone fixed it)
sudo docker pull nadil95/lashiweb:latest

# Start container
sudo docker run -d -p 8081:80 --name geoapp nadil95/lashiweb:latest
```

---

## Optimization Tips

### Tag Docker Images by Build Number

Update Jenkinsfile to use build numbers:

```groovy
environment {
    DOCKER_IMAGE = "nadil95/lashiweb"
    DOCKER_TAG = "${BUILD_NUMBER}"
}
```

Then push both tagged and latest:
```groovy
docker push $DOCKER_IMAGE:$DOCKER_TAG
docker tag $DOCKER_IMAGE:$DOCKER_TAG $DOCKER_IMAGE:latest
docker push $DOCKER_IMAGE:latest
```

This allows easy rollback to specific builds.

### Add Health Checks

Add to Jenkinsfile after deployment:

```groovy
stage('Health Check') {
    steps {
        script {
            sh '''
                sleep 5
                curl -f http://13.134.139.151:8081 || exit 1
            '''
        }
    }
}
```

---

## Security Best Practices

1. **Don't commit secrets** - Use Jenkins credentials
2. **Use SSH keys** - Already configured with `geo-ssh`
3. **Limit SSH access** - Configure EC2 security groups
4. **Change admin password** - Set `VITE_ADMIN_PASSWORD` env var
5. **Use HTTPS** - Configure nginx with SSL certificates

---

## Next Steps After Deployment

1. ✅ Verify all routes work (especially `/maduadmin`)
2. ✅ Test form submissions
3. ✅ Check browser console for errors
4. ✅ Change admin password from default
5. ✅ Monitor logs for any issues

---

## Support

For issues:
- Check Jenkins console output
- Check EC2 container logs: `sudo docker logs geoapp`
- Review nginx config in container
- See QUICK_FIX.md for common issues
