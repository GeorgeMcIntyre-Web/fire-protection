# Cloudflare Worker for Email Notifications

This worker sends email notifications for task deadlines and budget alerts.

## Quick Start

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set up secrets
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put RESEND_API_KEY
wrangler secret put FROM_EMAIL
wrangler secret put WORKER_SECRET

# Deploy
wrangler deploy
```

## Cron Schedule

The worker runs automatically every hour at minute 0 (e.g., 1:00, 2:00, 3:00...).

To change the schedule, edit `wrangler.toml`:

```toml
[triggers]
crons = ["0 * * * *"]  # Every hour
# crons = ["*/30 * * * *"]  # Every 30 minutes
# crons = ["0 9 * * *"]  # Daily at 9 AM
```

## Manual Trigger

```bash
curl -X POST \
  https://pm-email-notifications.YOUR_SUBDOMAIN.workers.dev \
  -H "Authorization: Bearer YOUR_WORKER_SECRET" \
  -H "Content-Type: application/json"
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key from Supabase | `eyJ...` |
| `RESEND_API_KEY` | Resend API key (or use SendGrid) | `re_...` |
| `FROM_EMAIL` | Sender email address | `notifications@yourdomain.com` |
| `WORKER_SECRET` | Secret for auth | `random-string-here` |

## Development

```bash
# Local development
wrangler dev

# View logs
wrangler tail

# List secrets
wrangler secret list
```

## See Also

- [Main Setup Guide](../EMAIL_NOTIFICATIONS_SETUP.md)
- [Supabase Schema](../supabase-notifications.sql)
