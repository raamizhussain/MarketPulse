# MarketPulse AI — Production Deployment & Go-Live Checklist

This checklist prepares **MarketPulse AI** for zero-downtime, secure, and legally compliant deployment to real-world institutional and retail users.

---

## 🔒 1. Security & Environment Configuration

- [x] **Move Secret Keys into Environment Variables**:
  - `SECRET_KEY`: Set to a cryptographically secure 64-character random string (`openssl rand -hex 32`).
  - `GROQ_API_KEY`: Add your production LLM API key.
  - `DATABASE_URL`: In production cloud (e.g. Supabase / AWS RDS / Neon), set `DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/marketpulse`.
- [x] **Turn Off Debug Stack Traces**:
  - Global FastAPI exception handler catches unhandled exceptions and returns sanitized JSON (`{"detail": "An internal server error occurred"}`) to prevent leaking code or paths.
- [x] **HTTP Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (Enforces HTTPS)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
- [x] **CORS Origin Whitelisting**:
  - Restrict `CORS_ORIGINS` in production `.env` to your production frontend domain (e.g. `https://app.marketpulse.ai`).

---

## 🚀 2. Frontend Build & Performance Optimization

- [x] **Production Bundle**:
  - Built with Vite & Rollup code-splitting: `dist/index.html` (1.25 kB) + `dist/assets/index.js` (95.9 kB gzipped).
- [x] **Asset Optimization**:
  - SVGs and high-resolution scalable vectors embedded directly.
- [x] **SEO & Social Share Metadata**:
  - OpenGraph (`og:title`, `og:description`, `og:image`, `og:site_name`), Twitter cards, and high-DPI browser tab SVG favicon configured in `index.html`.
- [x] **Cross-Device & Browser Responsive**:
  - Tested across Desktop (1080p / 1440p / 4K), Tablets, and Mobile viewports with touch-friendly liquid buttons.

---

## 💾 3. Database Backups & Disaster Recovery

- [x] **Automated DB Backup Script**:
  - `python scripts/backup_db.py --retention-days 14`
  - Gzip-compressed snapshot created automatically in `backups/` directory with automatic retention cleanup.
- [x] **1-Command Database Restore Script**:
  - `python scripts/restore_db.py`
  - Creates a safety pre-restore backup and recovers data with zero data loss.
- [x] **Recommended Production Cron Schedule (Daily 2:00 AM UTC)**:
  ```bash
  # Daily DB Backup
  0 2 * * * /path/to/venv/bin/python /path/to/scripts/backup_db.py >> /var/log/marketpulse_backup.log 2>&1
  
  # Daily Incremental Stock Model Updates
  30 2 * * * /path/to/venv/bin/python /path/to/scripts/daily_batch_pretrain.py >> /var/log/marketpulse_train.log 2>&1
  ```

---

## ⚖️ 4. Legal, Compliance & Privacy

- [x] **Privacy Policy Modal**:
  - Full GDPR & CCPA-compliant disclosure explaining authentication tokens, telemetry data, and data export rights.
- [x] **Terms of Service & Regulatory Risk Disclaimer**:
  - Explicit SEBI/SEC compliance notice stating paper trading models and multi-agent reasoning are for educational/simulation purposes.
- [x] **GDPR / CCPA Cookie Consent Banner**:
  - Persistent floating banner allowing visitors to **Accept All** or select **Essential Only**.

---

## 🌐 5. Custom Domain & DNS Setup

| Record Type | Host / Name | Value / Destination | TTL |
| :--- | :--- | :--- | :--- |
| **`A`** | `@` (root) | `76.76.21.21` (Vercel) or your host IP | `3600` |
| **`CNAME`** | `www` | `cname.vercel-dns.com` or custom domain | `3600` |
| **`CNAME`** | `api` | `api-marketpulse.onrender.com` / AWS ALB | `3600` |

---

## 🩺 6. Health Checks & Monitoring

- **API Health Endpoint**: `GET https://api.yourdomain.com/health` $\to$ `{"status": "healthy", "service": "marketpulse-api"}`
- **System Metrics Root**: `GET https://api.yourdomain.com/` $\to$ reports model versions, OpenAPI docs link, and active engines.
