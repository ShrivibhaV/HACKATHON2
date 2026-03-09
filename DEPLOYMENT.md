# NeuroLearn Deployment Guide

Complete guide for deploying NeuroLearn to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] OpenAI API key tested and valid
- [ ] Supabase project created (optional but recommended)
- [ ] Database migrations completed
- [ ] All tests passing
- [ ] Mobile responsiveness verified
- [ ] Dark mode tested
- [ ] Accessibility audit passed
- [ ] Analytics configured

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest deployment option with automatic scaling and built-in analytics.

### Step 1: Connect GitHub Repository

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Click "Import"

### Step 2: Configure Environment Variables

In Vercel project settings, add these variables:

```
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAi...
```

### Step 3: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Test the live URL
4. Set as production domain

Your app is now live!

### Vercel Benefits
- Automatic Git-connected deploys
- Serverless functions for API routes
- Built-in analytics and performance monitoring
- Automatic SSL certificates
- Global CDN for fast content delivery
- Automatic previews for pull requests
- 1-click rollbacks if needed

## Option 2: Deploy to Other Platforms

### Deploy to Netlify

1. Build the project:
   ```bash
   pnpm build
   ```

2. Connect to Netlify:
   - Push to GitHub
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select repository
   - Set build command: `pnpm build`
   - Set publish directory: `.next`

3. Add environment variables in Netlify dashboard

4. Deploy

### Deploy to AWS Amplify

1. Install AWS CLI and configure credentials

2. Initialize Amplify:
   ```bash
   amplify init
   ```

3. Add hosting:
   ```bash
   amplify add hosting
   ```

4. Deploy:
   ```bash
   amplify publish
   ```

### Deploy with Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t neurolearn .
docker run -p 3000:3000 -e OPENAI_API_KEY=... neurolearn
```

## Setting Up Supabase (Optional but Recommended)

Supabase provides user authentication and data persistence.

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name
4. Set a strong database password
5. Choose region closest to users
6. Click "Create new project"

Wait for project to initialize (2-3 minutes).

### Step 2: Get Credentials

In Supabase dashboard:
1. Go to "Settings" > "API"
2. Copy `URL` and `anon public` key
3. Add to your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Step 3: Create Database Tables

In Supabase SQL Editor, run:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student profiles
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  preferred_mode TEXT,
  dyslexia_weight FLOAT,
  adhd_weight FLOAT,
  reading_speed TEXT,
  focus_span TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning progress
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_id TEXT,
  words_read INT,
  comprehension_score FLOAT,
  session_duration INT,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  achievement_type TEXT,
  unlocked_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
```

### Step 4: Set Up Row Level Security

This ensures users can only see their own data:

```sql
-- Policies for student_profiles
CREATE POLICY "Users can view own profile"
ON student_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON student_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Policies for learning_progress
CREATE POLICY "Users can view own progress"
ON learning_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON learning_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## Environment Variables Reference

### Required for All Deployments

```bash
OPENAI_API_KEY=sk-...  # Get from openai.com/api-keys
```

### Optional for Full Features

```bash
# Supabase (for user accounts and data persistence)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Analytics (automatically configured in Vercel)
NEXT_PUBLIC_ANALYTICS_ID=...
```

## Performance Optimization

### Pre-Deployment

1. **Run Lighthouse audit**:
   ```bash
   pnpm build
   pnpm start
   # Open Chrome DevTools > Lighthouse
   ```

2. **Check bundle size**:
   ```bash
   pnpm analyze
   ```

3. **Test on slow networks**:
   - Chrome DevTools > Network > Slow 3G
   - Verify responsive design
   - Check loading states

### Post-Deployment

1. Monitor Core Web Vitals in production
2. Set up error tracking (Sentry)
3. Monitor API response times
4. Set up automated backups

## Scaling for Growth

### Database Optimization

1. Add indexes on frequently queried columns:
   ```sql
   CREATE INDEX idx_user_id ON learning_progress(user_id);
   CREATE INDEX idx_created_at ON learning_progress(created_at);
   ```

2. Enable database auto-scaling in Supabase

### CDN & Caching

1. Vercel automatically caches at edge
2. Configure cache headers in `next.config.mjs`:
   ```javascript
   module.exports = {
     headers: async () => [
       {
         source: '/static/:path*',
         headers: [
           { key: 'Cache-Control', value: 'public, max-age=31536000' }
         ]
       }
     ]
   };
   ```

### API Rate Limiting

Implement rate limiting for OpenAI API:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

## Monitoring & Analytics

### Set Up Error Tracking

Use Sentry for error monitoring:

1. Create account at [sentry.io](https://sentry.io)
2. Create Next.js project
3. Add to your app:

```bash
npm install @sentry/nextjs
```

4. Configure in `next.config.mjs`
5. Add error boundary component

### Monitor API Usage

1. Track OpenAI API costs in dashboard
2. Set spending limits in OpenAI account
3. Monitor request logs for abuse

### Analytics Dashboard

Configure in Vercel:
1. Go to project > Analytics
2. View:
   - Page views and user engagement
   - Core Web Vitals
   - Error rates
   - Geographic distribution

## Backup & Recovery

### Database Backups

Supabase automatically backs up daily.

To manually backup:
```bash
# Using Supabase CLI
supabase db pull  # Download schema
supabase db backup  # Create backup
```

To restore:
```bash
supabase db reset  # Full reset with backup
```

### Code Rollback

With Vercel:
1. Go to Deployments tab
2. Find previous deployment
3. Click "Promote to Production"
4. Done! No downtime.

## Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Row Level Security enabled on Supabase
- [ ] API keys rotated regularly
- [ ] No console.log of sensitive data
- [ ] CORS configured correctly
- [ ] Input validation on all forms
- [ ] HTML sanitization enabled (DOMPurify)
- [ ] Rate limiting configured
- [ ] Error messages don't leak data

## Post-Launch Checklist

- [ ] Monitor error logs for 24 hours
- [ ] Test all user flows
- [ ] Verify analytics working
- [ ] Check performance metrics
- [ ] Send to test users for feedback
- [ ] Create status page for monitoring
- [ ] Set up alerting for errors/downtime
- [ ] Document deployment process

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in detail
2. Verify all environment variables set
3. Check for TypeScript errors:
   ```bash
   pnpm type-check
   ```
4. Try local build: `pnpm build`

### API Not Working

1. Verify OpenAI API key in production
2. Check API usage limits
3. Review error logs in browser console
4. Test API directly with curl

### Performance Issues

1. Run Lighthouse audit
2. Check database query performance
3. Look for N+1 queries
4. Enable caching for static content
5. Reduce image sizes

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)

## Next Steps

1. Deploy to production
2. Monitor for issues
3. Gather user feedback
4. Iterate and improve
5. Scale based on usage

Happy deploying!
