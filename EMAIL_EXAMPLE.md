# Email Format Example

When someone fills out the contact form, you'll receive an email at **madhuhettiarachchi4@gmail.com** that looks like this:

---

**Subject:** New Contact Form Submission from John Smith

**Body:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW CONTACT FORM SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contact Details:
─────────────────────────
Name:    John Smith
Email:   john.smith@example.com
Phone:   +44 7123 456789

Message:
─────────────────────────
Hello! I'm interested in learning Western flute. I'm a complete
beginner and would like to know about lesson availability and
pricing. I'm based in Croydon and prefer in-person lessons.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Available Template Variables

Your EmailJS template can use these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{subject}}` | Email subject line | "New Contact Form Submission from John Smith" |
| `{{from_name}}` | Contact's name | "John Smith" |
| `{{from_email}}` | Contact's email | "john.smith@example.com" |
| `{{phone}}` | Contact's phone | "+44 7123 456789" or "Not provided" |
| `{{message}}` | Contact's message | "Hello! I'm interested in..." |
| `{{formatted_message}}` | Pre-formatted message with all details | See example above |
| `{{to_email}}` | Your email (optional) | "madhuhettiarachchi4@gmail.com" |

## Template Options

### Option 1: Use Pre-formatted Message (Easiest)

In your EmailJS template, simply use:

**Subject:** `{{subject}}`

**Body:** `{{formatted_message}}`

This will use the nicely formatted message that's already prepared in the code.

---

### Option 2: Custom Template

If you want to customize the email format, use individual fields:

**Subject:** `{{subject}}`

**Body:**
```
You have a new message from {{from_name}}!

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

Their message:
{{message}}

---
Reply to: {{from_email}}
```

---

## What Happens When Form is Submitted

1. ✅ User fills out form (Name, Email, Phone, Message)
2. ✅ User clicks "Send Message"
3. ✅ Button shows "Sending..."
4. ✅ EmailJS sends email to madhuhettiarachchi4@gmail.com
5. ✅ User sees success toast: "Message Sent!"
6. ✅ Form resets to empty
7. ✅ You receive email in Gmail inbox

## Testing

To test the email format:

1. Complete EmailJS setup (see [EMAILJS_SETUP.md](EMAILJS_SETUP.md))
2. Run `npm run dev`
3. Navigate to the Contact section
4. Fill out the form with test data
5. Submit
6. Check madhuhettiarachchi4@gmail.com inbox

You should receive a beautifully formatted email with all the contact details!
