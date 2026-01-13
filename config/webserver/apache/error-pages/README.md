# Custom Error Pages for Apache

This directory contains beautiful, customized error pages for the YektaYar platform's Apache web server configuration.

## 📋 Overview

Instead of displaying generic Apache error pages, these custom pages provide:

- ✨ **Beautiful design** with modern gradients and animations
- 🌐 **Persian language** (RTL support) with professional translations
- 📱 **Responsive** design that works on all devices
- ♿ **Accessible** with clear messaging
- 🎨 **Consistent branding** with YektaYar's visual style
- 🔄 **Auto-refresh** on 503 errors (backend downtime)

## 📁 Files

- **403.html** - Forbidden access (دسترسی ممنوع)
- **404.html** - Page not found (صفحه یافت نشد) with search functionality
- **500.html** - Internal server error (خطای داخلی سرور)
- **502.html** - Bad gateway (دروازه نامعتبر)
- **503.html** - Service unavailable (سرویس موقتاً در دسترس نیست) with beautiful animations
- **504.html** - Gateway timeout (اتمام زمان دروازه)
- **fancy-index-header.html** - Enhanced directory listing template for static files

## 🚀 Installation

### 1. Copy Error Pages to Server

```bash
# Create error pages directory
sudo mkdir -p /var/www/yektayar/error-pages

# Copy all error pages
sudo cp config/webserver/apache/error-pages/*.html /var/www/yektayar/error-pages/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/yektayar/error-pages
sudo chmod -R 755 /var/www/yektayar/error-pages
```

### 2. Update Apache Configuration

The Apache configuration files in this repository already include the necessary ErrorDocument directives and Alias settings. Simply copy the updated configurations:

```bash
# Copy updated Apache configs
sudo cp config/webserver/apache/*.conf /etc/apache2/sites-available/

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

### 3. Verify Installation

Test each error page:

```bash
# Test directly accessing error pages
curl https://api.yektayar.ir/error-pages/503.html
curl https://static.yektayar.ir/error-pages/404.html

# Test actual error scenarios (requires backend to be stopped)
curl https://api.yektayar.ir/
```

## 🎨 Features by Error Page

### 503 Service Unavailable
- **Animated particles** background for visual interest
- **Spinning loader** to indicate temporary status
- **Auto-refresh** after 30 seconds
- **Detailed explanation** of what might have happened
- Persian language with clear, helpful messaging

### 404 Not Found
- **Starry background** with twinkling animation
- **Search functionality** to help users find content
- **Navigation options** (home, back, search)
- Floating animation on the search icon

### 500, 502, 504 Errors
- **Gradient backgrounds** with smooth animations
- **Clear error messaging** explaining the issue
- **Action buttons** for retry and navigation
- Consistent design language across all pages

### 403 Forbidden
- **Security-focused messaging** 
- Clear explanation of access restrictions
- Simple navigation back to safe areas

### Fancy Directory Indexing
- **Modern file browser** interface
- **Search functionality** for finding files
- **File type icons** for visual clarity
- **File statistics** (count, total size)
- Breadcrumb navigation
- Responsive grid layout

## 🔧 Configuration Details

### ErrorDocument Directives

Each Apache VirtualHost includes:

```apache
# Custom Error Pages
ErrorDocument 403 /error-pages/403.html
ErrorDocument 404 /error-pages/404.html
ErrorDocument 500 /error-pages/500.html
ErrorDocument 502 /error-pages/502.html
ErrorDocument 503 /error-pages/503.html
ErrorDocument 504 /error-pages/504.html

# Error pages directory (served directly, not proxied)
Alias /error-pages /var/www/yektayar/error-pages
<Directory /var/www/yektayar/error-pages>
    Options -Indexes
    AllowOverride None
    Require all granted
</Directory>
```

### Static Files Directory Indexing

The `static.yektayar.ir.conf` includes enhanced directory indexing:

```apache
# Enable directory browsing with fancy indexing
IndexOptions FancyIndexing HTMLTable NameWidth=* DescriptionWidth=* FoldersFirst IconsAreLinks SuppressDescription
IndexOrderDefault Descending Date

# Fancy indexing style
HeaderName /error-pages/fancy-index-header.html
```

## 🎯 Design Philosophy

1. **User-Friendly**: Clear, non-technical language (in Persian)
2. **Actionable**: Always provide next steps (retry, go home, contact support)
3. **Beautiful**: Modern gradients, smooth animations, professional appearance
4. **Consistent**: Same design language across all error pages
5. **Accessible**: High contrast, readable fonts, responsive design
6. **Informative**: Explain what happened and why
7. **Branded**: Aligned with YektaYar's visual identity

## 🌐 Language & Localization

- **Primary Language**: Persian (Farsi) with RTL support
- **Text Direction**: Right-to-left (RTL)
- **Font Stack**: Optimized for Persian fonts (Vazir, Tahoma fallback)
- **Cultural Considerations**: Professional tone appropriate for healthcare platform

## 📱 Responsive Design

All pages are fully responsive with breakpoints:
- **Desktop**: Full layout with all features
- **Tablet**: Adapted grid layouts
- **Mobile**: Single-column, optimized for touch
  - Hidden secondary information on mobile
  - Larger touch targets
  - Simplified layouts

## 🔄 Auto-Refresh (503 Only)

The 503 page includes automatic refresh after 30 seconds:

```javascript
// Auto-refresh after 30 seconds
setTimeout(function() {
    location.reload();
}, 30000);
```

This helps when backend services are temporarily down but will recover quickly.

## 🎨 Customization

To customize the error pages:

1. **Colors**: Edit the gradient values in the `<style>` sections
2. **Text**: Update the Persian text content in the HTML
3. **Logo**: Replace the emoji icons with actual logo images
4. **Animation Speed**: Adjust `animation-duration` values in CSS
5. **Auto-refresh Timing**: Change the `setTimeout` value (currently 30000ms)

## 🧪 Testing

### Test Individual Pages

```bash
# Open in browser directly
open http://localhost/path-to/error-pages/503.html

# Or use curl
curl -I http://localhost/error-pages/503.html
```

### Test Error Scenarios

```bash
# Test 503 (stop backend first)
sudo systemctl stop yektayar-backend
curl https://api.yektayar.ir/

# Test 404
curl https://static.yektayar.ir/nonexistent-file.txt

# Test 403 (create a restricted directory)
curl https://static.yektayar.ir/restricted/
```

## 📊 Analytics & Monitoring

Consider adding analytics to error pages to track:
- How often each error occurs
- User behavior on error pages (clicks, searches)
- Time spent on error pages
- Device/browser information

You can add Google Analytics or similar tracking code to each error page.

## 🔐 Security Considerations

- Error pages don't expose sensitive server information
- No stack traces or internal paths
- Generic messages that don't reveal system architecture
- All pages served with proper security headers from Apache config

## 📚 Additional Resources

- [Apache ErrorDocument Documentation](https://httpd.apache.org/docs/2.4/custom-error.html)
- [Apache mod_autoindex Documentation](https://httpd.apache.org/docs/2.4/mod/mod_autoindex.html)
- [YektaYar Webserver Setup Guide](../README.md)

## 🤝 Support

For issues or questions about error pages:
- Check Apache error logs: `sudo tail -f /var/log/apache2/*_error.log`
- Verify file permissions: `ls -la /var/www/yektayar/error-pages/`
- Test Apache config: `sudo apache2ctl configtest`

---

**Last Updated**: 2025-11-15  
**Maintainer**: YektaYar Team
