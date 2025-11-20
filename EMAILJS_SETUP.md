# EmailJS Setup Instructions

This guide will help you set up EmailJS to enable the contact form to send emails to madhuhettiarachchi4@gmail.com.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Add Email Service

1. After logging in, go to **Email Services** section
2. Click **Add New Service**
3. Choose **Gmail** as your email service
4. Click **Connect Account** and authorize your Gmail account (madhuhettiarachchi4@gmail.com)
5. Give your service a name (e.g., "Flute Lessons Contact")
6. Copy the **Service ID** (you'll need this later)
7. Click **Create Service**

## Step 3: Create Email Template

1. Go to **Email Templates** section
2. Click **Create New Template**
3. Set up your template with the following details:

**Template Name:** Contact Form Submission

**Subject:** {{subject}}

**Email Body - Option 1 (Simple & Clean):**
```
{{from_name}} has sent you a message from your website:

━━━━━━━━━━━━━━━━━━━━━━━
Contact Details
━━━━━━━━━━━━━━━━━━━━━━━

Name:    {{from_name}}
Email:   {{from_email}}
Phone:   {{phone}}

Message:
───────────────────────
{{message}}

━━━━━━━━━━━━━━━━━━━━━━━
Sent via LF Flauto Contact Form
```

**Email Body - Option 2 (Pre-formatted, just use this):**
```
{{formatted_message}}
```

4. In the **To Email** field, enter: madhuhettiarachchi4@gmail.com
5. Copy the **Template ID** (you'll need this later)
6. Click **Save**

**Note:** The code sends both individual fields (`from_name`, `from_email`, `phone`, `message`) AND a pre-formatted message (`formatted_message`). You can use either in your template!

## Step 4: Get Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (also called API Key)
3. Copy the **Public Key**

## Step 5: Configure Environment Variables

1. In your project root, create a file named `.env` (copy from `.env.example`)
2. Add your EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_from_step_2
VITE_EMAILJS_TEMPLATE_ID=your_template_id_from_step_3
VITE_EMAILJS_PUBLIC_KEY=your_public_key_from_step_4
```

3. **IMPORTANT:** Make sure `.env` is in your `.gitignore` file to keep credentials secret

## Step 6: Restart Development Server

```bash
npm run dev
```

## Step 7: Test the Contact Form

1. Visit your website
2. Fill out the contact form
3. Submit the form
4. Check madhuhettiarachchi4@gmail.com inbox for the email

## Troubleshooting

### Emails Not Sending?

1. **Check EmailJS Dashboard:**
   - Log into EmailJS
   - Go to **Email History** to see if emails are being sent
   - Check for any error messages

2. **Verify Environment Variables:**
   - Make sure `.env` file is in the project root
   - Restart the dev server after creating `.env`
   - Check that variable names start with `VITE_`

3. **Check Gmail Settings:**
   - Make sure madhuhettiarachchi4@gmail.com is the correct email
   - Check spam/junk folder
   - Verify Gmail account is properly connected in EmailJS

4. **Free Tier Limits:**
   - EmailJS free tier allows 200 emails/month
   - If exceeded, emails won't send until next month or upgrade to paid plan

### Browser Console Errors?

Open browser Developer Tools (F12) and check Console tab for error messages. Common issues:
- Missing environment variables
- Network connectivity issues
- EmailJS service/template ID mismatch

## Security Notes

- Never commit your `.env` file to Git
- Public Key is safe to use in frontend code (it's meant to be public)
- Service ID and Template ID are also safe to expose
- EmailJS handles authentication securely

## Alternative: No Environment Variables Setup

If you don't want to use environment variables, you can hardcode the values directly in [Contact.tsx](src/components/Contact.tsx):

```typescript
const serviceId = 'your_service_id';
const templateId = 'your_template_id';
const publicKey = 'your_public_key';
```

**Note:** This is less secure but acceptable for a simple contact form.

## Cost

EmailJS is **free** for up to 200 emails/month. For this flute lessons website, this should be more than enough.

## Support

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: [https://www.emailjs.com/support/](https://www.emailjs.com/support/)

---

# Production Deployment with Jenkins

## Problem in Production

The contact form works locally but fails in production with:
```
Email sending failed: The Public Key is invalid
```

**Root Cause:** Environment variables from `.env` file are not available during Docker build in Jenkins.

## Solution for Jenkins CI/CD

### Step 1: Add EmailJS Credentials to Jenkins

1. **Go to Jenkins Dashboard**
2. **Navigate to:** Manage Jenkins → Credentials → System → Global credentials (unrestricted)
3. **Click "Add Credentials"**

Create these THREE credentials:

#### Credential 1: EmailJS Service ID
- **Kind:** Secret text
- **Scope:** Global
- **Secret:** `service_53o80pp` (your actual service ID)
- **ID:** `emailjs-service-id`
- **Description:** EmailJS Service ID for contact form

#### Credential 2: EmailJS Template ID
- **Kind:** Secret text
- **Scope:** Global
- **Secret:** `template_ppjxjp8` (your actual template ID)
- **ID:** `emailjs-template-id`
- **Description:** EmailJS Template ID for contact form

#### Credential 3: EmailJS Public Key
- **Kind:** Secret text
- **Scope:** Global
- **Secret:** `9q86Ly5ckwPY13LNm` (your actual public key)
- **ID:** `emailjs-public-key`
- **Description:** EmailJS Public Key for contact form

**⚠️ Important:** The IDs must match exactly:
- `emailjs-service-id`
- `emailjs-template-id`
- `emailjs-public-key`

### Step 2: Verify Files are Updated

The following files have been updated to support environment variables:

✅ **Dockerfile** - Accepts build arguments
✅ **Jenkinsfile** - Passes credentials as build arguments

### Step 3: Deploy

1. **Commit and push the changes**
2. **Trigger a Jenkins build**
3. Jenkins will:
   - Load the credentials
   - Build Docker image with EmailJS config
   - Push to Docker Hub
   - Deploy to EC2

### Step 4: Verify

After deployment:

1. Visit: http://13.134.139.151:8081/contact (or your domain)
2. Fill out and submit the contact form
3. Check for success message
4. Verify email received at madhuhettiarachchi4@gmail.com

## How It Works in Production

### Build Process Flow:

```
Jenkins Credentials (Secure)
    ↓
Jenkinsfile loads credentials
    ↓
Passes as --build-arg to Docker
    ↓
Dockerfile accepts as ARG → ENV
    ↓
Vite bundles into JavaScript at build time
    ↓
Production website has EmailJS config embedded
```

## Troubleshooting Production

### 1. "Invalid Public Key" error persists

**Check Jenkins credentials:**
```bash
# In Jenkins, verify credentials exist:
Manage Jenkins → Credentials → Global
```

Look for:
- emailjs-service-id
- emailjs-template-id
- emailjs-public-key

### 2. Verify environment variables in build

Check Jenkins console output for:
```
Building Docker image with environment variables...
docker build --build-arg VITE_EMAILJS_SERVICE_ID=...
```

### 3. Check if vars are in the Docker image

```bash
# SSH to EC2
ssh ubuntu@13.134.139.151

# Check if EmailJS config is in the built JavaScript
sudo docker exec geoapp sh -c "grep -o 'service_53o80pp' /usr/share/nginx/html/assets/*.js | head -1"
```

If you see `service_53o80pp`, the config is correctly bundled.

### 4. Force rebuild

If credentials were just added:
```bash
# Trigger a new Jenkins build
# Or manually on EC2:
ssh ubuntu@13.134.139.151
sudo docker stop geoapp && sudo docker rm geoapp
sudo docker pull nadil95/lashiweb:latest
sudo docker run -d -p 8081:80 --name geoapp nadil95/lashiweb:latest
```

## Security Notes for Production

### Why Build Arguments?

- ✅ Secrets stored securely in Jenkins
- ✅ Not committed to git
- ✅ Can be updated without code changes
- ✅ Different values per environment

### Are EmailJS Keys Safe to Expose?

⚠️ EmailJS public keys are designed to be in frontend JavaScript. However:

**Recommended:** Add domain restrictions in EmailJS dashboard:
1. Go to your EmailJS service settings
2. Add "Allowed Origins": `https://lflauto.co.uk`
3. This prevents unauthorized use

**Monitor usage:**
- Check EmailJS dashboard for unusual activity
- Free tier: 200 emails/month limit

## Quick Reference

### Your Current EmailJS Credentials:
```
Service ID:  service_53o80pp
Template ID: template_ppjxjp8
Public Key:  9q86Ly5ckwPY13LNm
```

### Jenkins Credential IDs (must match exactly):
```
emailjs-service-id
emailjs-template-id
emailjs-public-key
```

### Test URLs:
```
Local:      http://localhost:5173/contact
Production: http://13.134.139.151:8081/contact
Domain:     https://lflauto.co.uk/contact
```
