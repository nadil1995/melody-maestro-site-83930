# Contact Form Not Sending Messages - URGENT FIX

## Current Status: Not Working ❌

The contact form is showing "**The Public Key is invalid**" error and not sending emails.

---

## Root Cause

The EmailJS environment variables are **not being passed** during the Docker build in Jenkins production. The code was falling back to literal string values like `'VITE_EMAILJS_SERVICE_ID'` instead of the actual credentials.

---

## ✅ IMMEDIATE FIX - 3 Steps (5 minutes)

### Step 1: Add EmailJS Credentials to Jenkins

**This is the CRITICAL step you need to do RIGHT NOW:**

1. **Open Jenkins:** Go to your Jenkins dashboard
2. **Navigate to:** Manage Jenkins → Credentials → System → Global credentials (unrestricted)
3. **Click:** "Add Credentials"

**Add these THREE "Secret text" credentials:**

#### Credential #1: Service ID
```
Kind:        Secret text
Scope:       Global
Secret:      service_53o80pp
ID:          emailjs-service-id
Description: EmailJS Service ID
```

#### Credential #2: Template ID
```
Kind:        Secret text
Scope:       Global
Secret:      template_ppjxjp8
ID:          emailjs-template-id
Description: EmailJS Template ID
```

#### Credential #3: Public Key
```
Kind:        Secret text
Scope:       Global
Secret:      9q86Ly5ckwPY13LNm
ID:          emailjs-public-key
Description: EmailJS Public Key
```

**⚠️ CRITICAL:** The "ID" field must match EXACTLY:
- `emailjs-service-id`
- `emailjs-template-id`
- `emailjs-public-key`

### Step 2: Trigger Jenkins Build

After adding the credentials:

1. Go to your Jenkins pipeline
2. Click **"Build Now"**
3. Wait for the build to complete (~3-5 minutes)

### Step 3: Test the Contact Form

1. Visit: http://13.134.139.151:8081/contact
2. Fill out the form
3. Submit
4. You should see: ✅ "Message Sent! Thank you for your interest..."
5. Check email: madhuhettiarachchi4@gmail.com

---

## What Changed in the Code

### Before (Broken)
```typescript
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'VITE_EMAILJS_SERVICE_ID';
```
This was using the literal string `'VITE_EMAILJS_SERVICE_ID'` as fallback, causing EmailJS to fail.

### After (Fixed)
```typescript
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;

if (!serviceId || !templateId || !publicKey) {
  throw new Error('EmailJS not configured');
}
```
Now it properly checks if variables exist and shows a clear error if missing.

---

## Verification Checklist

After deploying, verify:

- [ ] Jenkins credentials added (all 3)
- [ ] Jenkins build completed successfully
- [ ] Container restarted on EC2
- [ ] Contact form loads without console errors
- [ ] Form submission shows success message
- [ ] Email received at madhuhettiarachchi4@gmail.com

---

## How to Verify Credentials are Working

### Check Jenkins Build Log

In Jenkins console output, look for:
```
Building Docker image with environment variables...
docker build --build-arg VITE_EMAILJS_SERVICE_ID=...
```

If you see this, credentials are being passed correctly.

### Check Browser Console (After Deployment)

1. Open website: http://13.134.139.151:8081/contact
2. Open Developer Tools (F12)
3. Go to Console tab
4. Try submitting the form

**Expected outputs:**

❌ **If credentials missing:**
```
EmailJS configuration missing. Check environment variables.
```

✅ **If working:**
No errors, form submits successfully

### Check Docker Container (SSH to EC2)

```bash
ssh ubuntu@13.134.139.151

# Check if EmailJS config is in the built JavaScript
sudo docker exec geoapp sh -c "grep -o 'service_53o80pp' /usr/share/nginx/html/assets/*.js | head -1"
```

**Expected output:**
```
/usr/share/nginx/html/assets/index-XXX.js:service_53o80pp
```

If you see this, the credentials are correctly bundled.

---

## Troubleshooting

### "EmailJS not configured" Error

**Cause:** Environment variables not passed during build

**Solution:**
1. Verify Jenkins credentials exist with correct IDs
2. Trigger a new Jenkins build
3. Check Jenkins console output for `--build-arg` flags

### "The Public Key is invalid" Error

**Cause:** Old Docker image still running

**Solution:**
```bash
ssh ubuntu@13.134.139.151
sudo docker stop geoapp && sudo docker rm geoapp
sudo docker pull nadil95/lashiweb:latest
sudo docker run -d -p 8081:80 --name geoapp nadil95/lashiweb:latest
```

### Form Submits but No Email Received

**Possible causes:**

1. **Check spam folder** at madhuhettiarachchi4@gmail.com
2. **Check EmailJS dashboard:**
   - Login to https://dashboard.emailjs.com
   - Go to "Email History"
   - Check if emails are being sent
3. **Check EmailJS limits:**
   - Free tier: 200 emails/month
   - If exceeded, upgrade or wait for reset

### Jenkins Build Fails

**Check for:**
```
withCredentials: No such DSL method 'string' found
```

This means the Jenkins credential type is wrong. Use "Secret text", not "String Parameter".

---

## Files Modified (Already Committed)

- ✅ [Dockerfile](Dockerfile) - Accepts build args
- ✅ [Jenkinsfile](Jenkinsfile) - Passes EmailJS credentials
- ✅ [src/pages/Contact.tsx](src/pages/Contact.tsx) - Fixed fallback logic

All changes pushed to `v1` branch.

---

## Quick Reference

### EmailJS Credentials
```
Service ID:  service_53o80pp
Template ID: template_ppjxjp8
Public Key:  9q86Ly5ckwPY13LNm
```

### Jenkins Credential IDs (MUST match exactly)
```
emailjs-service-id
emailjs-template-id
emailjs-public-key
```

### Test URLs
```
Local:      http://localhost:5173/contact
Production: http://13.134.139.151:8081/contact
Domain:     https://lflauto.co.uk/contact
```

### Admin Dashboard (Also Fixed)
```
URL:      http://13.134.139.151:8081/maduadmin
Password: madu2025admin
```

---

## Summary

**The contact form won't work until you:**

1. ✅ Add 3 credentials to Jenkins (5 minutes)
2. ✅ Trigger a new build
3. ✅ Test the form

**All code changes are done and pushed.** You just need to add the Jenkins credentials and rebuild!

---

## Need Help?

If it's still not working after following these steps:

1. Check Jenkins console output for errors
2. SSH to EC2 and check container logs: `sudo docker logs geoapp`
3. Verify credentials exist in Jenkins with correct IDs
4. See [EMAILJS_SETUP.md](EMAILJS_SETUP.md) for detailed troubleshooting
