# SPA Routing Configuration for Admin Dashboard

The admin dashboard at `/maduadmin` requires proper server configuration to work because this is a Single Page Application (SPA) using React Router.

## Problem
When you navigate to `https://lflauto.co.uk/maduadmin`, the server tries to find a file at that path, which doesn't exist. All routing in this React app happens client-side, so the server must serve `index.html` for all routes.

---

## Solution for NGINX (Your Current Setup)

Add this configuration to your nginx server block:

```nginx
server {
    listen 80;
    server_name lflauto.co.uk;
    root /path/to/your/dist/folder;
    index index.html;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### How to Apply

1. **Edit your nginx configuration file:**
   - Typically located at `/etc/nginx/sites-available/lflauto.co.uk` or `/etc/nginx/nginx.conf`
   - Add the `try_files $uri $uri/ /index.html;` line to your location block

2. **Test the configuration:**
   ```bash
   sudo nginx -t
   ```

3. **Reload nginx:**
   ```bash
   sudo systemctl reload nginx
   # or
   sudo service nginx reload
   ```

---

## Alternative: Apache (.htaccess)

If your server uses Apache instead, create a `.htaccess` file in your `public/` directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## For Vercel Hosting

If you migrate to Vercel, the `vercel.json` file is already included in this repo:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## For Netlify Hosting

Create a `_redirects` file in your `public/` directory:

```
/*    /index.html   200
```

---

## Testing After Configuration

1. Clear your browser cache
2. Navigate to: `https://lflauto.co.uk/maduadmin`
3. You should see the admin login screen
4. Default password: `madu2025admin` (change this in production!)

---

## Where is Your Site Hosted?

Based on the nginx error, your site is running on an nginx server. You need to:

1. **Access your server** (via SSH or hosting control panel)
2. **Locate the nginx config** for lflauto.co.uk
3. **Add the `try_files` directive** as shown above
4. **Reload nginx**

If you're using a hosting panel like cPanel, Plesk, or similar, look for "Nginx Directives" or "Additional nginx directives" in the control panel.

---

## Need Help?

If you don't have access to the nginx configuration, contact your hosting provider and ask them to add SPA routing support for your React application.
