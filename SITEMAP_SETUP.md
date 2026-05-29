# Sitemap Setup Guide

## Overview

Your website now has a complete sitemap setup for search engine optimization (SEO). This includes both an HTML sitemap page and an XML sitemap for search engines.

## Files Created

### 1. **Sitemap HTML Page** (`src/pages/Sitemap.tsx`)
- **Location**: `/sitemap`
- **Purpose**: User-friendly sitemap displaying all pages on the website
- **Features**:
  - Interactive page listings with descriptions
  - Priority and change frequency information
  - Download button for XML sitemap
  - SEO information section

### 2. **Sitemap XML File** (`public/sitemap.xml`)
- **Location**: `https://www.lflauto.co.uk/sitemap.xml`
- **Purpose**: Automated sitemap for search engines
- **Format**: Standard XML Sitemap Protocol v0.9

### 3. **Robots.txt** (`public/robots.txt`)
- **Updated** to include sitemap reference
- **Disallows**: `/maduadmin` (admin dashboard)
- **Allows**: All public pages

## Sitemap Contents

The sitemap includes the following pages:

| Page | URL | Priority | Change Frequency |
|------|-----|----------|------------------|
| Home | `/` | 1.0 | Weekly |
| About | `/about` | 0.8 | Monthly |
| Portfolio | `/portfolio` | 0.8 | Weekly |
| Gallery | `/gallery` | 0.7 | Monthly |
| Contact | `/contact` | 0.8 | Monthly |
| Sitemap | `/sitemap` | 0.5 | Monthly |

## MIME Type Configuration Issue

### Problem
Google Search Console reports the sitemap as "HTML" instead of "XML"

### Root Cause
The web server serving `sitemap.xml` is not configured to use the correct MIME type (`application/xml`)

### Solution

Choose based on your hosting provider:

#### **Vercel Deployment**
Create `vercel.json` in project root:
```json
{
  "headers": [
    {
      "source": "/sitemap.xml",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/xml; charset=UTF-8"
        }
      ]
    }
  ]
}
```

#### **Netlify Deployment**
Create `netlify.toml` in project root:
```toml
[[headers]]
for = "/sitemap.xml"
[headers.values]
Content-Type = "application/xml; charset=UTF-8"
```

#### **Static Hosting (nginx)**
Add to nginx configuration:
```nginx
location ~ \.xml$ {
  types { application/xml xml; }
}
```

#### **Apache (.htaccess)**
Add to `.htaccess` in public folder:
```apache
AddType application/xml .xml
```

#### **GitHub Pages / Other Static Hosts**
If your host doesn't allow header configuration:
1. Name the file `sitemap` (without extension)
2. Configure server to serve without extension
3. Or use the Sitemap page at `/sitemap` route instead

## How to Use

### For Website Visitors
- Visit `https://www.lflauto.co.uk/sitemap` to see the HTML sitemap
- Download the XML sitemap using the download button on that page

### For Search Engines

#### **Google Search Console**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (lflauto.co.uk)
3. Go to **Sitemaps** → **Add/test sitemap**
4. Enter: `https://www.lflauto.co.uk/sitemap.xml`
5. Click **Submit**

#### **Bing Webmaster Tools**
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Select your site
3. Go to **Sitemaps** section
4. Add the sitemap URL: `https://www.lflauto.co.uk/sitemap.xml`
5. Submit

### Via robots.txt
Search engines can automatically discover the sitemap from `robots.txt`:
- Location: `https://www.lflauto.co.uk/robots.txt`
- Contains: `Sitemap: https://www.lflauto.co.uk/sitemap.xml`

## Maintenance

### Update Sitemap When
- Adding new pages to the website
- Changing page content significantly (update `lastmod` date)
- Changing update frequency for pages

### Steps to Update
1. Update `src/pages/Sitemap.tsx` - Add/modify page in `sitemapLinks` array
2. Update `public/sitemap.xml` - Add/modify corresponding `<url>` entry
3. Update `src/App.tsx` - Add route for new page if applicable
4. Deploy changes

### Date Format
Use ISO 8601 format: `YYYY-MM-DD`
Example: `2025-12-23`

## Testing

### Validate XML Format
1. Visit: `https://www.lflauto.co.uk/sitemap.xml`
2. Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
3. Upload or paste your sitemap

### Test in Search Consoles
- Google Search Console shows validation errors
- Bing Webmaster Tools provides coverage insights

### Check MIME Type
Use curl to verify headers:
```bash
curl -I https://www.lflauto.co.uk/sitemap.xml
```

Expected header:
```
Content-Type: application/xml; charset=UTF-8
```

## Troubleshooting

### Sitemap shows as HTML in Google Search Console

**Cause**: Server MIME type misconfiguration

**Solutions**:
1. Check your hosting provider's documentation for MIME type configuration
2. Use the configuration files provided above for your hosting platform
3. Wait 24-48 hours for Google to re-crawl
4. Contact your hosting provider's support if issue persists

### Pages not indexed

**Possible Causes**:
- noindex meta tag on page (check)
- Robots.txt blocking the page (check)
- robots meta tag set to nofollow
- Page is new (may take time to index)

**Solutions**:
1. Remove any robots blocking
2. Request indexing in Google Search Console
3. Submit page URL directly to Google

### 404 errors in Google Search Console

**Cause**: URLs in sitemap don't match actual page URLs

**Solution**:
1. Verify all URLs in sitemap are correct
2. Check that routes in `App.tsx` match sitemap URLs
3. Update sitemap with correct URLs

## Best Practices

✅ **Keep sitemap updated** - Add new pages within 24 hours

✅ **Set realistic change frequencies** - Honest frequencies help crawl budget

✅ **Use accurate priorities** - Help search engines understand page importance

✅ **Monitor in Search Console** - Check for errors and coverage

✅ **Update lastmod dates** - When significant content changes occur

❌ **Don't** - List duplicate content (use canonical tags instead)

❌ **Don't** - Include admin/login pages

❌ **Don't** - Link to external sites in sitemap

## Additional Resources

- [XML Sitemap Protocol](https://www.sitemaps.org/)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/beginner/sitemaps)
- [Bing Sitemap Documentation](https://www.bing.com/webmasters/help/sitemaps-3b5cf6a1)

## Current Status

✅ HTML Sitemap page created and deployed
✅ XML Sitemap file created
✅ Robots.txt updated with sitemap reference
✅ Sitemap page added to routing
⚠️ **PENDING**: Configure hosting provider MIME types for `.xml` files

## Next Steps

1. **Fix MIME Type Issue**: Apply the appropriate configuration for your hosting provider
2. **Submit to Search Engines**: Use the steps above to submit to Google and Bing
3. **Monitor**: Check Google Search Console for coverage and errors
4. **Maintain**: Update sitemap as you add new content

