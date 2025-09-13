# 🕰️ Quiet Hours Scheduler

> A modern web application for scheduling focused study sessions with intelligent email reminders.

![Quiet Hours Scheduler](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 📋 Table of Contents

1. [Features & Overview](#-features--overview)
2. [Tech Stack](#-tech-stack)
3. [Architecture](#️-architecture)
4. [Installation & Setup](#️-installation--setup)
5. [Database Configuration](#-database-configuration)
6. [Email Service Setup](#-email-service-setup)
7. [Deployment Guide](#-deployment-guide)
8. [Usage Instructions](#-usage-instructions)
9. [API Documentation](#-api-documentation)
10. [Testing](#-testing)

---

## ✨ Features & Overview

### Core Features

- **🎯 Smart Scheduling**: Create custom quiet study blocks with flexible timing
- **📧 Email Reminders**: Automatic notifications 10 minutes before each session
- **🚫 No Conflicts**: Intelligent system prevents overlapping notifications per user
- **🔄 Recurring Sessions**: Set up daily, weekly, or custom recurring study blocks
- **👤 User Authentication**: Secure login/signup with Supabase Auth
- **📱 Responsive Design**: Beautiful UI built with shadcn/ui components
- **⚡ Server-Side Rendering**: Optimized Next.js SSR for better performance

### Security Features

- **🔐 Row Level Security**: Database-level access control
- **🛡️ Authentication**: Secure user management with Supabase Auth
- **🔒 CRON Protection**: API endpoints secured with secret tokens
- **✅ Input Validation**: Form validation with Zod schemas
- **🎯 Type Safety**: Full TypeScript coverage

---

## 🚀 Tech Stack

### Frontend

- **Next.js 15**: React framework with App Router and SSR
- **React 19**: Latest React with concurrent features
- **TypeScript 5**: Full type safety and modern JavaScript features
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: Modern, accessible component library

### Backend & Database

- **Supabase**: PostgreSQL database with real-time features
- **Supabase Auth**: Authentication and user management
- **Row Level Security**: Database-level security policies
- **PostgreSQL**: Robust relational database

### Email & Notifications

- **Resend**: Modern email API for transactional emails
- **Vercel CRON**: Scheduled email notifications
- **HTML Email Templates**: Beautiful, responsive email designs

### Development Tools

- **React Hook Form**: Performant form handling
- **Zod**: TypeScript-first schema validation
- **date-fns**: Modern date utility library
- **Lucide React**: Beautiful icon library

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   SSR Pages     │ Client Components│       Static Assets         │
│                 │                 │                             │
│ • Home (SSR)    │ • LoginForm     │ • Images & Icons            │
│ • Login (SSR)   │ • SignupForm    │ • Fonts (Geist)            │
│ • Signup (SSR)  │ • Dashboard*    │ • CSS Styles               │
│ • Dashboard(SSR)│ • CRUD Forms    │ • shadcn/ui Components     │
└─────────────────┴─────────────────┴─────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION TIER                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Next.js API   │   Middleware    │      Auth Context           │
│                 │                 │                             │
│ • CRON Jobs     │ • Session Mgmt  │ • User State                │
│ • Email Trigger │ • Route Guard   │ • Auth Methods              │
│ • Webhooks      │ • Cookie Mgmt   │ • Profile Check             │
│ • Test Endpoints│ • Redirects     │ • Persistent Sessions       │
└─────────────────┴─────────────────┴─────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE TIER                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│    Supabase     │     Resend      │        Vercel               │
│                 │                 │                             │
│ • PostgreSQL    │ • Email API     │ • Hosting                   │
│ • Auth Service  │ • Templates     │ • CRON Jobs                 │
│ • RLS Policies  │ • Delivery      │ • Edge Functions            │
│ • Real-time     │ • Analytics     │ • Static Assets             │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Data Flow

```
User Action → SSR Page → Client Component → API Route → Supabase → Email Service
     ↑                                                      ↓
     └─────────────── CRON Job ←─── Vercel ←─── Notification
```

---

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js 20+** installed
- **Git** for version control
- **Supabase account** (free tier available)
- **Resend account** (free tier available)
- **Vercel account** (free tier available)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd quiet-hours-scheduler
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Resend Configuration
   RESEND_API_KEY=your_resend_api_key

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # CRON Security (generate a random string)
   CRON_SECRET=your_random_secret_for_cron_jobs
   ```

4. **Set up the database** (see Database Configuration section)

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Configuration

### Step 1: Create Supabase Project

1. **Go to [Supabase](https://supabase.com)**
2. **Click "New Project"**
3. **Choose your organization and enter project details**
4. **Wait for the project to be ready (2-3 minutes)**

### Step 2: Run Database Schema

1. **Go to the SQL Editor** in your Supabase dashboard
2. **Copy and paste the entire contents** of `supabase-schema.sql`
3. **Run the script** to create all tables, policies, and functions

The schema includes:

- **Tables**: `profiles`, `quiet_blocks`, `email_notifications`
- **Row Level Security**: Secure access policies
- **Indexes**: Optimized for performance
- **Functions**: Auto-profile creation and timestamp updates
- **Triggers**: Automatic profile creation on user signup

### Step 3: Configure Authentication

1. **Go to Authentication > Settings**
2. **Configure your site URL**: `https://your-app.vercel.app` (or localhost for dev)
3. **Add redirect URLs**:
   - `http://localhost:3000/dashboard` (development)
   - `https://your-app.vercel.app/dashboard` (production)

### Step 4: Get Environment Variables

1. **Go to Settings > API**
   - Copy your **Project URL**
   - Copy your **anon/public key**
2. **Go to Settings > Database**
   - Copy your **service role key** (keep this secret!)

---

## 📧 Email Service Setup

### Step 1: Create Resend Account

1. **Go to [Resend](https://resend.com)**
2. **Sign up** with your email address
3. **Verify your email** address

### Step 2: Get API Key

1. **Go to [API Keys](https://resend.com/api-keys)**
2. **Click "Create API Key"**
3. **Name it** "Quiet Hours Scheduler"
4. **Copy the API key** and add to your `.env.local`

### Step 3: Domain Setup (Optional - Production)

For production use with custom domains:

1. **Go to [Domains](https://resend.com/domains)**
2. **Click "Add Domain"**
3. **Enter your domain** (e.g., `yourapp.com`)
4. **Add the required DNS records**:

   - **SPF**: `v=spf1 include:_spf.resend.com ~all`
   - **DKIM**: Add the provided DKIM record
   - **DMARC**: `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourapp.com`

5. **Update email addresses** in `src/lib/email.ts`:
   ```typescript
   from: "Quiet Hours Scheduler <noreply@yourapp.com>";
   ```

### Development vs Production

- **Development**: Uses `onboarding@resend.dev` (can only send to your registered email)
- **Production**: Use your verified domain for sending to any email address

---

## 🚀 Deployment Guide

### Quick Deploy to Vercel

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**

   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   In your Vercel project settings, add all variables from `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   RESEND_API_KEY
   NEXT_PUBLIC_APP_URL (set to your Vercel domain)
   CRON_SECRET
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - CRON jobs are configured in `vercel.json` to run every 5 minutes

### Alternative Deployment Platforms

#### Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Netlify

- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `.next`
- Add environment variables in Netlify dashboard

---

## 📖 Usage Instructions

### Getting Started

1. **Sign Up**

   - Visit your deployed app
   - Click "Get Started" or "Sign Up"
   - Enter your email, name, and password
   - Check your email for confirmation (if email confirmation is enabled)

2. **Sign In**
   - Use your email and password to sign in
   - You'll be redirected to the dashboard automatically

### Creating Your First Quiet Block

1. **Navigate to Dashboard**

   - After login, you'll see your personal dashboard
   - View stats: Total sessions, today's sessions, notification status

2. **Create a Session**

   - Click "Create Session" button
   - Fill in the form:
     - **Title**: Name your study session (e.g., "Math Study")
     - **Description**: Optional details about what you'll study
     - **Date**: When the session will occur (must be in future)
     - **Start Time**: When you want to start studying
     - **End Time**: When you want to finish studying
   - Click "Create Quiet Block"

3. **Email Notification**
   - You'll automatically receive an email reminder 10 minutes before your session
   - The email includes session details and preparation tips

### Managing Your Sessions

- **View Sessions**: All your quiet blocks are displayed on the dashboard
- **Edit Sessions**: Click the settings menu (⚙️) on any quiet block → Edit
- **Delete Sessions**: Click the settings menu → Delete (with confirmation)
- **Track Progress**: View stats cards showing your activity

### Session Features

- **Today's Highlight**: Sessions scheduled for today are prominently displayed
- **Time Formatting**: 12-hour format with AM/PM
- **Date Display**: Smart formatting (Today, Tomorrow, Yesterday, or full date)
- **Recurring Support**: Mark sessions as recurring (future feature)

---

## 🔌 API Documentation

### Authentication Endpoints

The app uses Supabase Auth, but here are the key flows:

#### Sign Up

```typescript
POST /auth/signup (handled by Supabase)
Body: { email, password, options: { data: { full_name } } }
```

#### Sign In

```typescript
POST /auth/signin (handled by Supabase)
Body: { email, password }
```

### Custom API Endpoints

#### Send Notifications (CRON)

```http
POST /api/send-notifications
Headers: Authorization: Bearer ${CRON_SECRET}
```

**Response:**

```json
{
  "message": "Notifications processed",
  "total": 5,
  "success": 4,
  "failures": 1
}
```

#### Test Email

```http
POST /api/test-email
Content-Type: application/json

{
  "type": "reminder|welcome",
  "email": "user@example.com",
  "name": "User Name",
  "title": "Study Session",
  "startTime": "2:00 PM",
  "endTime": "3:00 PM",
  "date": "Today"
}
```

#### Supabase Webhooks

```http
POST /api/webhooks/supabase
Content-Type: application/json

{
  "type": "INSERT",
  "table": "profiles",
  "record": { "email": "user@example.com", "full_name": "User Name" }
}
```

---

## 🧪 Testing

### Manual Testing

#### 1. Authentication Flow

```bash
# Test signup
curl -X POST "your-supabase-url/auth/v1/signup" \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test login
curl -X POST "your-supabase-url/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 2. Email System

```bash
# Test reminder email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "reminder",
    "email": "your-email@gmail.com",
    "name": "Test User",
    "title": "Test Study Session",
    "startTime": "2:00 PM",
    "endTime": "3:00 PM",
    "date": "Today"
  }'

# Test welcome email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "your-email@gmail.com",
    "name": "Test User"
  }'
```

#### 3. CRON Job Testing

```bash
# Manually trigger notifications (development only)
curl -X POST http://localhost:3000/api/send-notifications \
  -H "Authorization: Bearer your_cron_secret"
```

### Automated Testing Checklist

- [ ] **User Registration**: Sign up with new email
- [ ] **Email Confirmation**: Check welcome email delivery
- [ ] **Login Flow**: Sign in with credentials
- [ ] **Dashboard Access**: Verify redirect to dashboard
- [ ] **Quiet Block Creation**: Create a session 15+ minutes in future
- [ ] **Email Notification**: Verify reminder email arrives 10 minutes before
- [ ] **Edit Session**: Modify an existing quiet block
- [ ] **Delete Session**: Remove a quiet block
- [ ] **Route Protection**: Try accessing /login while logged in
- [ ] **Session Persistence**: Refresh browser, verify still logged in

---

## 📊 Database Schema Details

### Tables Structure

#### profiles

```sql
id UUID PRIMARY KEY (references auth.users)
email TEXT UNIQUE NOT NULL
full_name TEXT
avatar_url TEXT
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

#### quiet_blocks

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES profiles(id)
title TEXT NOT NULL
description TEXT
start_time TIME NOT NULL
end_time TIME NOT NULL
date DATE NOT NULL
is_recurring BOOLEAN DEFAULT FALSE
recurrence_pattern TEXT
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

#### email_notifications

```sql
id UUID PRIMARY KEY
quiet_block_id UUID REFERENCES quiet_blocks(id)
user_id UUID REFERENCES profiles(id)
scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL
sent_at TIMESTAMP WITH TIME ZONE
status TEXT CHECK (status IN ('pending', 'sent', 'failed'))
error_message TEXT
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

### Row Level Security Policies

```sql
-- Users can only access their own data
CREATE POLICY "Users can manage their own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own quiet blocks" ON quiet_blocks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users and service can manage email notifications" ON email_notifications
    FOR ALL USING (
        auth.uid() = user_id OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );
```

---

## 📁 Project Structure

```
quiet-hours-scheduler/
├── public/                     # Static assets
│   ├── favicon.ico
│   └── *.svg                  # Icons and logos
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── send-notifications/  # CRON job endpoint
│   │   │   ├── test-email/          # Email testing
│   │   │   └── webhooks/            # Supabase webhooks
│   │   ├── dashboard/        # Dashboard page (SSR)
│   │   ├── login/           # Login page (SSR)
│   │   ├── signup/          # Signup page (SSR)
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page (SSR)
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── DashboardClient.tsx    # Client-side dashboard logic
│   │   ├── DashboardHeader.tsx    # Dashboard header
│   │   ├── LoginForm.tsx          # Login form
│   │   ├── SignupForm.tsx         # Signup form
│   │   ├── QuietBlockForm.tsx     # Create/edit form
│   │   ├── EditQuietBlockDialog.tsx
│   │   ├── DeleteQuietBlockDialog.tsx
│   │   └── ProfileCheck.tsx       # Auto-profile creation
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   └── lib/               # Utilities and configurations
│       ├── supabase/      # Supabase client setup
│       │   ├── client.ts  # Browser client
│       │   ├── server.ts  # Server client
│       │   └── middleware.ts # Auth middleware
│       ├── database.types.ts # TypeScript types
│       ├── email.ts       # Email service
│       └── utils.ts       # Utility functions
├── middleware.ts          # Next.js middleware
├── vercel.json           # Vercel configuration
├── supabase-schema.sql   # Database schema
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── DOCUMENTATION.md      # This file
```

---

## 🔐 Security Considerations

### Authentication Security

- **Secure cookies**: Supabase handles secure session cookies
- **HTTPS only**: All authentication requires HTTPS in production
- **Session timeout**: Configurable session duration
- **Password requirements**: Minimum 6 characters (configurable)

### Database Security

- **Row Level Security**: All tables have RLS enabled
- **User isolation**: Users can only access their own data
- **Service role protection**: CRON jobs use service role key
- **Input sanitization**: All inputs are validated and sanitized

### API Security

- **CRON protection**: Secret token required for CRON endpoints
- **Rate limiting**: Consider adding rate limiting for production
- **Error handling**: No sensitive data exposed in error messages
- **CORS**: Properly configured for your domain

### Production Security Checklist

- [ ] All environment variables are set
- [ ] Supabase RLS policies are enabled
- [ ] CRON secret is strong and unique
- [ ] Email domain is verified
- [ ] HTTPS is enforced
- [ ] Error logging is configured
- [ ] Backup strategy is in place

---

## 📈 Performance Optimization

### Next.js Optimizations

- **Server-Side Rendering**: Most pages are SSR for better performance
- **Static Generation**: Static assets are optimized
- **Image Optimization**: Next.js automatic image optimization
- **Font Optimization**: Google Fonts are optimized
- **Bundle Splitting**: Automatic code splitting

### Database Optimizations

- **Indexes**: All foreign keys and query patterns are indexed
- **Composite Indexes**: Multi-column indexes for common queries
- **Partial Indexes**: Conditional indexes for specific queries
- **Query Optimization**: Efficient query patterns

### Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Metrics**: Database performance metrics
- **Resend Analytics**: Email delivery metrics
- **Error Tracking**: Comprehensive error logging

---

## 🤝 Development Guidelines

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting (if configured)
- **Component Structure**: Separation of server/client components
- **Error Handling**: Consistent error handling patterns

### Git Workflow

```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request and merge
```

### Environment Management

- **Development**: `.env.local`
- **Staging**: Vercel environment variables
- **Production**: Vercel environment variables with production keys

---

## 📞 Support & Resources

### Documentation Links

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Resend**: [resend.com/docs](https://resend.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)

### Community

- **Next.js Discord**: [discord.gg/nextjs](https://discord.gg/nextjs)
- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
