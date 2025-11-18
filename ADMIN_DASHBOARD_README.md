# Admin Dashboard - User Analytics & Engagement Tracking

A hidden admin dashboard to track user engagement, page views, and contact form submissions for the LF Flauto website.

## Features

✅ **Hidden Access** - No visible links, accessible only via manual URL
✅ **Password Protected** - Secure login required
✅ **Real-time Analytics** - Track user behavior as it happens
✅ **Local Storage** - All data stored in browser localStorage
✅ **Contact Form Tracking** - See all form submissions with full details
✅ **Page View Analytics** - Track which pages are most viewed
✅ **User Actions** - Monitor specific user interactions
✅ **Session Tracking** - Count total website visits

## Accessing the Dashboard

### URL
Navigate to: **`https://yourwebsite.com/maduadmin`**

Example: `http://localhost:5173/maduadmin` (development)

### Default Password
**Password:** `madu2025admin`

⚠️ **IMPORTANT:** Change this password before deploying to production!

## Changing the Admin Password

### Method 1: Environment Variable (Recommended)

Add to your `.env` file:
```env
VITE_ADMIN_PASSWORD=your_secure_password_here
```

Then restart your dev server:
```bash
npm run dev
```

### Method 2: Hardcode (Not Recommended for Production)

Edit `src/pages/AdminDashboard.tsx` line 27:
```typescript
const ADMIN_PASSWORD = 'your_secure_password_here';
```

## Dashboard Features

### 1. Overview Stats
- **Total Page Views** - Number of page visits across all pages
- **Form Submissions** - Total contact form submissions
- **User Actions** - Total tracked interactions
- **Total Sessions** - Number of times someone visited the site

### 2. Page Views by Page
See which pages are most popular:
- Home
- About
- Portfolio
- Gallery
- Contact

### 3. Recent Page Views
Last 10 page visits with:
- Page name
- Timestamp
- Relative time (e.g., "5m ago")

### 4. Recent User Actions
Track specific interactions:
- Button clicks
- Form submissions
- Navigation events
- Custom tracked actions

### 5. Contact Form Submissions
View all contact form submissions with:
- **Name** - Contact's full name
- **Email** - Contact's email address
- **Phone** - Phone number (if provided)
- **Message** - Full message content
- **Timestamp** - When submitted
- **Relative Time** - How long ago

## What is Tracked?

### Automatic Tracking

1. **Page Views**
   - Every time a user visits a page
   - Includes user agent and referrer
   - Tracked on: Home, About, Portfolio, Gallery

2. **Form Submissions**
   - Contact form submissions
   - Full contact details
   - Message content
   - Timestamp

3. **User Sessions**
   - Total number of website visits
   - Session start time

### Manual Tracking (Optional)

You can track custom user actions anywhere in the code:

```typescript
import { useAnalytics } from "@/contexts/AnalyticsContext";

const MyComponent = () => {
  const { trackUserAction } = useAnalytics();

  const handleClick = () => {
    trackUserAction('Button Clicked', 'ComponentName', 'Button: Book Lesson');
  };

  return <button onClick={handleClick}>Book Lesson</button>;
};
```

## Data Management

### View Data
All data is stored in browser localStorage under the key: `lflauto_analytics`

### Clear Data
Click the **"Clear Data"** button in the dashboard to reset all analytics.

⚠️ **Warning:** This action cannot be undone!

### Export Data (Manual)
Open browser DevTools Console and run:
```javascript
JSON.parse(localStorage.getItem('lflauto_analytics'))
```

Copy and save the output to export analytics data.

## Data Privacy & GDPR

### What is Stored
- Page URLs visited
- User agent string (browser info)
- Referrer (previous page URL)
- Form submission data (name, email, phone, message)
- Timestamps

### What is NOT Stored
- IP addresses
- Cookies
- Personal tracking identifiers
- Cross-site data

### Data Location
All data is stored **locally in the browser** (localStorage). It is:
- Not sent to any external servers
- Only accessible from the same browser/device
- Cleared when browser data is cleared

### Compliance
Since data is stored locally and not transmitted to servers, this falls under "strictly necessary" cookies/storage for website functionality.

However, you may want to add a privacy notice:
- Inform users that basic analytics are collected
- Explain data is stored locally
- Provide a way to opt-out (clear browser data)

## Security Considerations

### Password Protection
- Change the default password immediately
- Use a strong, unique password
- Do not share the password
- Consider using environment variables

### Session Security
- Login session expires when browser tab is closed
- No persistent authentication tokens
- Password must be re-entered each session

### Hidden URL
- No links to `/maduadmin` in the website
- Not listed in sitemaps
- Relies on URL obscurity (not a strong security measure alone)

### Recommendations
For production:
1. Change default password
2. Use HTTPS (always)
3. Consider IP whitelisting (server-side)
4. Implement rate limiting on login attempts
5. Add two-factor authentication (advanced)

## Troubleshooting

### Dashboard shows no data
- Visit some pages first to generate data
- Submit the contact form
- Check browser localStorage for `lflauto_analytics`

### Password not working
- Check environment variable is set correctly
- Restart dev server after changing `.env`
- Check for typos in password

### Can't access `/maduadmin`
- Make sure you're using the full URL
- Check that the route is defined in `App.tsx`
- Clear browser cache

### Data disappeared
- Browser data/cache was cleared
- localStorage was manually deleted
- Different browser or device (data is per-browser)

## Technical Details

### Files Created
- `src/contexts/AnalyticsContext.tsx` - Analytics provider and hooks
- `src/hooks/usePageTracking.ts` - Automatic page view tracking hook
- `src/pages/AdminDashboard.tsx` - Admin dashboard UI
- `src/App.tsx` - Updated with analytics provider and route

### Files Modified
- `src/pages/Index.tsx` - Added page tracking
- `src/pages/About.tsx` - Added page tracking
- `src/pages/Portfolio.tsx` - Added page tracking
- `src/pages/Gallery.tsx` - Added page tracking
- `src/components/Contact.tsx` - Added form submission tracking

### Dependencies
No new dependencies required! Uses existing:
- React Context API
- React Router
- localStorage API
- shadcn/ui components

## Future Enhancements

Potential improvements:
- [ ] Export analytics to CSV
- [ ] Date range filtering
- [ ] Charts and graphs
- [ ] Email notifications for new submissions
- [ ] Backend API integration
- [ ] Advanced user behavior analytics
- [ ] Conversion tracking
- [ ] Referrer source analytics

---

**Support:** For issues or questions about the admin dashboard, check the code comments or modify as needed.

**Security:** Remember to change the default password and protect access to the dashboard!
