# Static Site Deployment Guide

This project is configured for static site generation and can be deployed to any static hosting service.

## Building the Static Site

To build the static site, run:

```bash
npm run build
```

This will generate the static files in the `out/` directory.

## Local Testing

To test the static site locally:

```bash
npm run serve
```

This will serve the static site on `http://localhost:3000`.

## Deployment Options

### 1. GitHub Pages
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Set source to "GitHub Actions"
4. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### 2. Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `out`

### 3. Vercel
1. Connect your repository to Vercel
2. The project will be automatically detected as a Next.js app
3. It will build and deploy automatically

### 4. AWS S3 + CloudFront
1. Upload the `out/` directory contents to an S3 bucket
2. Configure the bucket for static website hosting
3. Set up CloudFront for CDN (optional)

### 5. Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
# Select the 'out' directory as your public directory
firebase deploy
```

## Configuration

The project is already configured for static export in `next.config.mjs`:

```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};
```

## Features Included in Static Build

✅ Responsive design (mobile, tablet, desktop)
✅ Interactive product slider with touch/mouse support
✅ Infinite scroll functionality
✅ Optimized images and assets
✅ CSS animations and transitions
✅ SEO metadata

## File Structure After Build

```
out/
├── index.html          # Main page
├── 404.html           # 404 error page
├── favicon.ico         # Site icon
├── logo/              # Logo assets
├── product/           # Product images
├── product_nav/       # Navigation wheel
└── _next/             # Next.js optimized assets
    ├── static/
    └── chunks/
```

## Performance Optimizations

- Images are preloaded for better performance
- CSS is minified and optimized
- JavaScript is chunked and lazy-loaded
- Static generation ensures fast loading times
- Hardware-accelerated CSS animations
- Optimized for mobile devices

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes
- Touch gesture support for mobile devices
