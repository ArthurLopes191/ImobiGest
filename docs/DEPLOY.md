# Guia de Deploy - ImobiGest

## 🚀 Opções de Deploy

### 1. Vercel (Recomendado)

#### Vantagens
- ✅ Integração nativa com Next.js
- ✅ Deploy automático via Git
- ✅ CDN global
- ✅ Certificados SSL automáticos
- ✅ Ambiente de preview para PRs
- ✅ Analytics integrado

#### Setup Inicial

1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

2. **Login na Vercel**
```bash
vercel login
```

3. **Configurar Projeto**
```bash
vercel
# Seguir instruções do CLI
```

4. **Deploy**
```bash
vercel --prod
```

#### Configuração via GitHub

1. **Conectar Repositório**
   - Acesse [vercel.com](https://vercel.com)
   - Importe o repositório do GitHub
   - Configure as variáveis de ambiente

2. **Variáveis de Ambiente**
```
NEXT_PUBLIC_API_BASE_URL=https://api.imobigest.com
```

3. **Deploy Automático**
   - Push para `main` = deploy em produção
   - Push para outras branches = deploy de preview

### 2. Netlify

#### Setup

1. **Instalar Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Build e Deploy**
```bash
npm run build
netlify deploy --prod --dir=.next
```

#### Configuração via Git

1. **netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. AWS Amplify

#### Deploy via Console
1. Conectar repositório GitHub
2. Configurar build settings
3. Adicionar variáveis de ambiente
4. Deploy automático

#### amplify.yml
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 4. DigitalOcean App Platform

#### app.yaml
```yaml
name: imobigest
services:
- environment_slug: node-js
  github:
    branch: main
    deploy_on_push: true
    repo: ArthurLopes191/ImobiGest
  name: web
  run_command: npm start
  build_command: npm run build
  envs:
  - key: NODE_ENV
    value: production
  - key: NEXT_PUBLIC_API_BASE_URL
    value: ${API_BASE_URL}
  http_port: 3000
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  source_dir: /
```

### 5. Docker + VPS

#### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build da aplicação
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar arquivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - web
    restart: unless-stopped
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server web:3000;
    }

    server {
        listen 80;
        server_name imobigest.com www.imobigest.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name imobigest.com www.imobigest.com;

        ssl_certificate /etc/ssl/cert.pem;
        ssl_certificate_key /etc/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## 🔧 Configurações de Build

### next.config.ts
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone para Docker
  output: 'standalone',
  
  // Compressão
  compress: true,
  
  // Otimizações de imagem
  images: {
    domains: ['localhost', 'api.imobigest.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "build:analyze": "ANALYZE=true next build",
    "build:docker": "docker build -t imobigest .",
    "start:docker": "docker run -p 3000:3000 imobigest"
  }
}
```

## 🌍 Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Environment
NODE_ENV=development
```

### Produção (.env.production)
```env
# API
NEXT_PUBLIC_API_BASE_URL=https://api.imobigest.com

# Analytics
NEXT_PUBLIC_GA_ID=G-YYYYYYYYYY

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://yyy@sentry.io/yyy
SENTRY_ORG=imobigest
SENTRY_PROJECT=frontend

# Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 📊 Monitoramento

### 1. Analytics com Google Analytics

#### Setup
```typescript
// src/lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: URL) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};
```

#### Implementação
```typescript
// src/app/layout.tsx
import Script from 'next/script';
import { GA_TRACKING_ID } from '@/lib/gtag';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        {GA_TRACKING_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2. Error Tracking com Sentry

#### Instalação
```bash
npm install @sentry/nextjs
```

#### Configuração
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 3. Uptime Monitoring

#### UptimeRobot
- Configurar check HTTP a cada 5 minutos
- Alertas via email/SMS
- Dashboard público opcional

#### Pingdom
- Monitoramento de múltiplas localizações
- Alertas avançados
- Relatórios de performance

## 🔒 Segurança em Produção

### 1. HTTPS
- Sempre usar certificados SSL válidos
- Configurar HSTS headers
- Redirecionar HTTP para HTTPS

### 2. Headers de Segurança
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
        }
      ],
    },
  ];
}
```

### 3. Validação de Ambiente
```typescript
// src/lib/env.ts
const requiredEnvVars = ['NEXT_PUBLIC_API_BASE_URL'] as const;

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

## 📈 Performance

### 1. Bundle Analysis
```bash
npm run build:analyze
```

### 2. Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci && npm run build
      - run: npm install -g @lhci/cli@0.11.x
      - run: lhci autorun
```

### 3. Web Vitals Monitoring
```typescript
// src/lib/vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
    });
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Build - "Module not found"
```bash
# Limpar cache e reinstalar
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### 2. Variáveis de Ambiente não Carregadas
- Verificar se as variáveis estão prefixadas com `NEXT_PUBLIC_`
- Reiniciar o servidor de desenvolvimento
- Verificar se o arquivo `.env.local` está no diretório correto

#### 3. Erro de Hydration
- Verificar renderização condicional baseada em `typeof window`
- Usar `useEffect` para código que depende do browser
- Verificar diferenças entre SSR e cliente

#### 4. Performance Issues
```bash
# Análise de bundle
npm run build -- --analyze

# Verificar importações desnecessárias
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

### Logs de Debug

#### Vercel
```bash
vercel logs [deployment-url]
```

#### Docker
```bash
docker logs [container-name]
```

#### Local
```typescript
// Configurar logging detalhado
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    logging: {
      level: 'verbose',
    },
  },
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test (quando implementado)
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Staging Environment
- Branch `develop` → deploy automático para staging
- Branch `main` → deploy automático para produção
- Pull requests → deploy de preview

## 📋 Checklist de Deploy

### Pré-Deploy
- [ ] Todos os testes passando
- [ ] Build local funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets configurados
- [ ] DNS apontando para o serviço

### Pós-Deploy
- [ ] Site carregando corretamente
- [ ] Login funcionando
- [ ] APIs respondendo
- [ ] Performance dentro do esperado
- [ ] Monitoramento ativo
- [ ] Certificado SSL válido

### Rollback Plan
- [ ] Backup da versão anterior
- [ ] Script de rollback testado
- [ ] Plano de comunicação definido
- [ ] Responsabilidades claras