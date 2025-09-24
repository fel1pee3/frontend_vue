## Aula 11 — Deploy e CI/CD

### Objetivos
- Configurar builds para produção
- Deploy em diferentes plataformas
- Configurar pipelines de CI/CD
- Gerenciar ambientes (dev/staging/prod)
- Implementar deployment automático
- Configurar monitoramento e logs
- Otimizar para produção
- Implementar rollback strategies

---

### Build para Produção

#### Configuração de Environment

##### `.env.development`

```bash
VITE_APP_TITLE=Vue App - Development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
VITE_SENTRY_DSN=
VITE_GTM_ID=
```

##### `.env.staging`

```bash
VITE_APP_TITLE=Vue App - Staging
VITE_API_BASE_URL=https://api-staging.example.com/api
VITE_APP_ENV=staging
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=warn
VITE_SENTRY_DSN=your-staging-sentry-dsn
VITE_GTM_ID=GTM-STAGING
```

##### `.env.production`

```bash
VITE_APP_TITLE=Vue App
VITE_API_BASE_URL=https://api.example.com/api
VITE_APP_ENV=production
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=error
VITE_SENTRY_DSN=your-production-sentry-dsn
VITE_GTM_ID=GTM-PROD123
VITE_ENABLE_PWA=true
```

#### `src/config/environment.js`

```javascript
/**
 * Configuração de ambiente
 */
export const ENV = {
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Vue App',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  GTM_ID: import.meta.env.VITE_GTM_ID,
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === 'true',
  
  // Computed properties
  get isDevelopment() {
    return this.APP_ENV === 'development'
  },
  
  get isStaging() {
    return this.APP_ENV === 'staging'
  },
  
  get isProduction() {
    return this.APP_ENV === 'production'
  }
}

// Validate required environment variables
const requiredVars = ['VITE_API_BASE_URL']

if (ENV.isProduction) {
  requiredVars.push('VITE_SENTRY_DSN', 'VITE_GTM_ID')
}

for (const varName of requiredVars) {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
}

export default ENV
```

#### `vite.config.production.js`

```javascript
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      
      // PWA Plugin
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.example\.com\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheKeyWillBeUsed: async ({ request }) => {
                  return `${request.url}?v=${Date.now()}`
                }
              }
            }
          ]
        },
        manifest: {
          name: env.VITE_APP_TITLE,
          short_name: 'VueApp',
          description: 'Professional Vue.js Application',
          theme_color: '#007bff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    
    build: {
      // Production optimizations
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : []
        }
      },
      
      // Code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            ui: ['bootstrap'],
            utils: ['axios', 'lodash']
          },
          
          // Optimize file names
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      
      // Asset optimization
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      
      // Source maps for production debugging
      sourcemap: mode === 'staging'
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    
    // Performance budget
    build: {
      ...{},
      chunkSizeWarningLimit: 1000
    },
    
    // Define global constants
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
    }
  }
})
```

---

### Deploy Platforms

#### Netlify Deploy

##### `netlify.toml`

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

# Production context
[context.production]
  environment = { VITE_APP_ENV = "production" }

# Staging context
[context.deploy-preview]
  environment = { VITE_APP_ENV = "staging" }

[context.branch-deploy]
  environment = { VITE_APP_ENV = "staging" }

# Redirects and rewrites
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/api/:splat"
  status = 200
  force = true

# Headers for security
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Vercel Deploy

##### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.example.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "env": {
    "VITE_APP_ENV": "production"
  },
  "build": {
    "env": {
      "VITE_API_BASE_URL": "https://api.example.com/api"
    }
  }
}
```

#### AWS S3 + CloudFront

##### `deploy-aws.js`

```javascript
const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
})

const s3 = new AWS.S3()
const cloudfront = new AWS.CloudFront()

const BUCKET_NAME = process.env.S3_BUCKET_NAME
const CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID
const BUILD_DIR = 'dist'

/**
 * Upload files to S3
 */
async function uploadToS3() {
  console.log('Starting S3 upload...')
  
  const files = getAllFiles(BUILD_DIR)
  const uploadPromises = files.map(uploadFile)
  
  await Promise.all(uploadPromises)
  console.log('S3 upload completed!')
}

/**
 * Get all files recursively
 */
function getAllFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir)
  
  for (const file of fileList) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, files)
    } else {
      files.push(filePath)
    }
  }
  
  return files
}

/**
 * Upload single file to S3
 */
async function uploadFile(filePath) {
  const fileContent = fs.readFileSync(filePath)
  const key = filePath.replace(`${BUILD_DIR}/`, '').replace(/\\/g, '/')
  const contentType = mime.lookup(filePath) || 'application/octet-stream'
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: getCacheControl(key),
    ACL: 'public-read'
  }
  
  try {
    await s3.upload(params).promise()
    console.log(`Uploaded: ${key}`)
  } catch (error) {
    console.error(`Error uploading ${key}:`, error)
    throw error
  }
}

/**
 * Get cache control based on file type
 */
function getCacheControl(key) {
  if (key.includes('assets/') && (key.endsWith('.js') || key.endsWith('.css'))) {
    return 'public, max-age=31536000, immutable'
  }
  
  if (key.endsWith('.html')) {
    return 'public, max-age=0, must-revalidate'
  }
  
  return 'public, max-age=86400'
}

/**
 * Invalidate CloudFront cache
 */
async function invalidateCloudFront() {
  console.log('Creating CloudFront invalidation...')
  
  const params = {
    DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: `deployment-${Date.now()}`,
      Paths: {
        Quantity: 1,
        Items: ['/*']
      }
    }
  }
  
  try {
    const result = await cloudfront.createInvalidation(params).promise()
    console.log('CloudFront invalidation created:', result.Invalidation.Id)
  } catch (error) {
    console.error('Error creating CloudFront invalidation:', error)
    throw error
  }
}

/**
 * Main deployment function
 */
async function deploy() {
  try {
    await uploadToS3()
    await invalidateCloudFront()
    console.log('Deployment completed successfully!')
  } catch (error) {
    console.error('Deployment failed:', error)
    process.exit(1)
  }
}

// Run deployment
deploy()
```

---

### CI/CD Pipelines

#### GitHub Actions

##### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  CACHE_KEY: node-modules-${{ hashFiles('**/package-lock.json') }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linter
      run: npm run lint
      
    - name: Run type check
      run: npm run type-check
      
    - name: Run unit tests
      run: npm run test:coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        
    - name: Run E2E tests
      run: |
        npm run build
        npm run test:e2e:ci
        
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.PROD_API_URL }}
        VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
        VITE_GTM_ID: ${{ secrets.GTM_ID }}
        
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist
        retention-days: 7
        
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist
        
    - name: Deploy to Netlify (Preview)
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: './dist'
        production-deploy: false
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
        enable-pull-request-comment: true
        enable-commit-comment: false
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist
        
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
        
    - name: Deploy to S3
      run: |
        aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_NAME }} --delete --cache-control "public, max-age=86400"
        aws s3 cp dist/index.html s3://${{ secrets.S3_BUCKET_NAME }}/index.html --cache-control "public, max-age=0, must-revalidate"
        
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
        
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
      
  lighthouse-ci:
    needs: deploy-production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        
    - name: Install Lighthouse CI
      run: npm install -g @lhci/cli@0.12.x
      
    - name: Run Lighthouse CI
      run: lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

#### GitLab CI

##### `.gitlab-ci.yml`

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"
  
cache:
  paths:
    - node_modules/
    - .npm/

before_script:
  - npm ci --cache .npm --prefer-offline

# Test stage
test:lint:
  stage: test
  script:
    - npm run lint

test:unit:
  stage: test
  script:
    - npm run test:coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
    expire_in: 1 week

test:e2e:
  stage: test
  services:
    - name: selenoid/vnc:chrome_78.0
      alias: chrome
  script:
    - npm run build
    - npm run test:e2e:ci
  artifacts:
    when: on_failure
    paths:
      - cypress/screenshots/
      - cypress/videos/
    expire_in: 1 week

# Build stage
build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  only:
    - main
    - merge_requests

# Deploy staging
deploy:staging:
  stage: deploy
  script:
    - npm install -g netlify-cli
    - netlify deploy --dir=dist --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - merge_requests
  dependencies:
    - build

# Deploy production
deploy:production:
  stage: deploy
  script:
    - aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
    - aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
    - aws configure set region us-east-1
    - aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete
    - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
  environment:
    name: production
    url: https://example.com
  only:
    - main
  dependencies:
    - build
  when: manual
```

---

### Docker Deployment

#### `Dockerfile`

```dockerfile
# Multi-stage build for production
FROM node:18-alpine as build-stage

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

# Install security updates
RUN apk update && apk upgrade

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### `nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json
        image/svg+xml;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security
        server_tokens off;
        
        # Main location
        location / {
            try_files $uri $uri/ /index.html;
            
            # Cache control for HTML files
            location ~* \.html$ {
                expires -1;
                add_header Cache-Control "no-cache, no-store, must-revalidate";
            }
        }
        
        # Static assets with long-term caching
        location /assets {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # API proxy (if needed)
        location /api {
            proxy_pass http://api-backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Error pages
        error_page 404 /index.html;
        error_page 500 502 503 504 /50x.html;
        
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
```

#### `docker-compose.yml`

```yaml
version: '3.8'

services:
  vue-app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.vue-app.rule=Host(`example.com`)"
      - "traefik.http.routers.vue-app.tls=true"
      - "traefik.http.routers.vue-app.tls.certresolver=letsencrypt"

  # Reverse proxy with SSL
  traefik:
    image: traefik:v2.9
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
    restart: unless-stopped

volumes:
  letsencrypt:
```

---

### Monitoring e Observabilidade

#### Error Tracking com Sentry

##### `src/plugins/sentry.js`

```javascript
import * as Sentry from "@sentry/vue"
import { BrowserTracing } from "@sentry/tracing"
import ENV from '@/config/environment'

export function initSentry(app, router) {
  if (!ENV.SENTRY_DSN) {
    console.warn('Sentry DSN not configured')
    return
  }
  
  Sentry.init({
    app,
    dsn: ENV.SENTRY_DSN,
    environment: ENV.APP_ENV,
    release: `vue-app@${__BUILD_VERSION__}`,
    
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracePropagationTargets: ["localhost", ENV.API_BASE_URL]
      })
    ],
    
    // Performance monitoring
    tracesSampleRate: ENV.isProduction ? 0.1 : 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out development errors
      if (ENV.isDevelopment) {
        console.error('Sentry Error:', event, hint)
      }
      
      // Don't send events for network errors
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null
      }
      
      return event
    },
    
    // User context
    initialScope: {
      tags: {
        component: "frontend",
        version: __BUILD_VERSION__
      }
    }
  })
}

// Custom error boundary
export function captureException(error, context = {}) {
  Sentry.withScope(scope => {
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key])
    })
    
    Sentry.captureException(error)
  })
}

// Performance monitoring
export function startTransaction(name, operation = 'navigation') {
  return Sentry.startTransaction({
    name,
    op: operation
  })
}
```

#### Analytics com Google Tag Manager

##### `src/plugins/gtm.js`

```javascript
import ENV from '@/config/environment'

export function initGTM() {
  if (!ENV.GTM_ID) {
    console.warn('GTM ID not configured')
    return
  }
  
  // Load GTM script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${ENV.GTM_ID}`
  document.head.appendChild(script)
  
  // GTM initialization
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  })
}

// Track events
export function trackEvent(action, category = 'General', label = '', value = 0) {
  if (!window.dataLayer) return
  
  window.dataLayer.push({
    event: 'custom_event',
    event_category: category,
    event_action: action,
    event_label: label,
    event_value: value
  })
}

// Track page views
export function trackPageView(pagePath, pageTitle) {
  if (!window.dataLayer) return
  
  window.dataLayer.push({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle
  })
}

// E-commerce tracking
export function trackPurchase(transactionId, items, value) {
  if (!window.dataLayer) return
  
  window.dataLayer.push({
    event: 'purchase',
    transaction_id: transactionId,
    value: value,
    currency: 'BRL',
    items: items
  })
}
```

---

### Rollback e Deployment Strategies

#### Blue-Green Deployment Script

##### `scripts/blue-green-deploy.js`

```javascript
const AWS = require('aws-sdk')

// Configure AWS
const cloudfront = new AWS.CloudFront()
const s3 = new AWS.S3()

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID
const BLUE_BUCKET = process.env.BLUE_BUCKET_NAME
const GREEN_BUCKET = process.env.GREEN_BUCKET_NAME

/**
 * Blue-Green Deployment Strategy
 */
class BlueGreenDeployment {
  constructor() {
    this.currentEnv = null
    this.targetEnv = null
  }
  
  async getCurrentEnvironment() {
    try {
      const config = await cloudfront.getDistributionConfig({
        Id: DISTRIBUTION_ID
      }).promise()
      
      const origin = config.DistributionConfig.Origins.Items[0]
      const bucketName = origin.DomainName.split('.')[0]
      
      this.currentEnv = bucketName === BLUE_BUCKET ? 'blue' : 'green'
      this.targetEnv = this.currentEnv === 'blue' ? 'green' : 'blue'
      
      console.log(`Current environment: ${this.currentEnv}`)
      console.log(`Target environment: ${this.targetEnv}`)
      
      return this.currentEnv
    } catch (error) {
      console.error('Error getting current environment:', error)
      throw error
    }
  }
  
  async deployToTarget() {
    const targetBucket = this.targetEnv === 'blue' ? BLUE_BUCKET : GREEN_BUCKET
    
    console.log(`Deploying to ${this.targetEnv} environment (${targetBucket})`)
    
    try {
      // Upload files to target bucket
      await this.uploadFiles(targetBucket)
      console.log('Files uploaded successfully')
      
      // Run health checks
      await this.runHealthChecks(targetBucket)
      console.log('Health checks passed')
      
      return true
    } catch (error) {
      console.error('Deployment to target failed:', error)
      throw error
    }
  }
  
  async switchTraffic() {
    try {
      console.log(`Switching traffic to ${this.targetEnv}`)
      
      const config = await cloudfront.getDistributionConfig({
        Id: DISTRIBUTION_ID
      }).promise()
      
      const distributionConfig = config.DistributionConfig
      const targetBucket = this.targetEnv === 'blue' ? BLUE_BUCKET : GREEN_BUCKET
      
      // Update origin to point to target bucket
      distributionConfig.Origins.Items[0].DomainName = `${targetBucket}.s3.amazonaws.com`
      
      await cloudfront.updateDistribution({
        Id: DISTRIBUTION_ID,
        DistributionConfig: distributionConfig,
        IfMatch: config.ETag
      }).promise()
      
      console.log('Traffic switched successfully')
      
      // Create invalidation
      await cloudfront.createInvalidation({
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: `switch-${Date.now()}`,
          Paths: {
            Quantity: 1,
            Items: ['/*']
          }
        }
      }).promise()
      
      console.log('CloudFront invalidation created')
      
    } catch (error) {
      console.error('Error switching traffic:', error)
      throw error
    }
  }
  
  async rollback() {
    try {
      console.log(`Rolling back to ${this.currentEnv}`)
      
      const config = await cloudfront.getDistributionConfig({
        Id: DISTRIBUTION_ID
      }).promise()
      
      const distributionConfig = config.DistributionConfig
      const currentBucket = this.currentEnv === 'blue' ? BLUE_BUCKET : GREEN_BUCKET
      
      // Revert origin back to current bucket
      distributionConfig.Origins.Items[0].DomainName = `${currentBucket}.s3.amazonaws.com`
      
      await cloudfront.updateDistribution({
        Id: DISTRIBUTION_ID,
        DistributionConfig: distributionConfig,
        IfMatch: config.ETag
      }).promise()
      
      console.log('Rollback completed successfully')
      
    } catch (error) {
      console.error('Error during rollback:', error)
      throw error
    }
  }
  
  async uploadFiles(bucketName) {
    // Implementation similar to previous S3 upload script
    // This would upload the dist files to the specified bucket
    console.log(`Uploading files to ${bucketName}`)
    // ... upload logic
  }
  
  async runHealthChecks(bucketName) {
    // Implement health checks for the target environment
    console.log(`Running health checks for ${bucketName}`)
    
    const testUrl = `https://${bucketName}.s3.amazonaws.com/health`
    
    try {
      const response = await fetch(testUrl)
      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`)
      }
      return true
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`)
    }
  }
}

// Usage
async function deploy() {
  const deployment = new BlueGreenDeployment()
  
  try {
    await deployment.getCurrentEnvironment()
    await deployment.deployToTarget()
    await deployment.switchTraffic()
    
    console.log('Deployment completed successfully!')
  } catch (error) {
    console.error('Deployment failed, initiating rollback...')
    await deployment.rollback()
    process.exit(1)
  }
}

// Command line interface
const command = process.argv[2]

switch (command) {
  case 'deploy':
    deploy()
    break
  case 'rollback':
    const deployment = new BlueGreenDeployment()
    deployment.getCurrentEnvironment().then(() => deployment.rollback())
    break
  default:
    console.log('Usage: node blue-green-deploy.js [deploy|rollback]')
}
```

---

### Scripts Package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --config vite.config.production.js",
    "build:staging": "vite build --mode staging",
    "preview": "vite preview",
    "lint": "eslint src --ext .vue,.js,.jsx,.cjs,.mjs --fix",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "cypress open",
    "test:e2e:ci": "cypress run",
    "deploy:aws": "node scripts/deploy-aws.js",
    "deploy:blue-green": "node scripts/blue-green-deploy.js deploy",
    "rollback": "node scripts/blue-green-deploy.js rollback",
    "lighthouse": "lhci autorun",
    "analyze": "npm run build && npx vite-bundle-analyzer dist"
  }
}
```

---

### Exercícios Práticos

#### Exercício 1: Multi-Environment Setup
Configurar três ambientes completos:
- Development com hot-reload
- Staging com source maps
- Production otimizada

#### Exercício 2: Pipeline Completo
Implementar pipeline que inclui:
- Testes automatizados
- Security scanning
- Performance budgets
- Automated rollback

#### Exercício 3: Monitoring Setup
Configurar monitoramento completo:
- Error tracking
- Performance monitoring
- Business metrics
- Alerting system

---

### Comandos Git

```bash
git add .
git commit -m "Aula 11 - Deploy e CI/CD"
```

---

### Curso Concluído! 🎉

Parabéns! Você completou o **Curso Completo de Vue.js**, cobrindo desde os conceitos básicos até tópicos avançados como deployment e CI/CD.

**Você aprendeu:**
- ✅ Fundamentos do Vue.js 3
- ✅ Composition API e reatividade
- ✅ Comunicação com APIs (Axios)
- ✅ Roteamento com Vue Router
- ✅ Formulários e validação avançada
- ✅ Gerenciamento de estado com Pinia
- ✅ Autenticação JWT completa
- ✅ Testes unitários e E2E
- ✅ Performance e otimização
- ✅ Deploy e CI/CD

**Continue praticando** e construa projetos incríveis com Vue.js!