# Dreamscape Curated Events

A luxury event planning website featuring beautiful design, interactive components, seamless user experience, and a comprehensive admin panel.

## 🌟 Features

### Public Pages
- **Home Page** - Elegant landing with hero section, brand intro, services preview, featured events, and love notes
- **About** - Meet the Executive Planner (Oseremen Ohiku) and company story
- **Services** - Weddings, Private & Social Events, Corporate & Brand Events, Special & Public Events, Destination Experiences
- **Portfolio (Blog)** - Showcase of curated events including Pearl & Donald's Dallas wedding
- **Love Notes** - Client testimonials from Nneoma Achioso and Dr. Chika Obetta
- **FAQ** - Common questions about planning, travel, and getting started
- **Contact** - Comprehensive inquiry form, Calendly booking, WhatsApp, Instagram, and newsletter signup

### Admin Panel (`/admin`)
- **Dashboard** - Overview of all site content and metrics
- **Content Management** - Edit all homepage, about, contact, and footer content
- **Blog/Portfolio Management** - Create, edit, reorder, and manage portfolio items
- **Services Management** - Full CRUD operations with preview functionality
- **Media Library** - Upload and manage images
- **Inquiries Management** - View and respond to event inquiries
- **Settings** - Configure site-wide settings
- **User Management** - Manage admin users and access control

### Authentication
- **Secure Login** - JWT-based authentication with NextAuth v5
- **Account Protection** - Failed login attempt tracking and account lockout
- **Session Management** - 30-day sessions with automatic refresh
- **Audit Logging** - All authentication events logged for security

### Database & CMS
- **Supabase** - PostgreSQL database with real-time capabilities
- **Content Management System** - All page content editable via admin panel
- **Image Storage** - Supabase Storage for media management
- **SWR Caching** - Intelligent data fetching with automatic revalidation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.2.1 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom brand colors
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

### Backend
- **API Routes**: Next.js API routes for all backend functionality
- **Authentication**: NextAuth v5 with credentials provider
- **Database**: PostgreSQL via Supabase
- **Storage**: Supabase Storage for media files
- **Email**: Resend for transactional emails

### UI Components
- Custom component library with 30+ reusable components
- Accordion, Button, Calendar, Card, Carousel, Checkbox, Input, Label, Radio Group, Select, Separator, Sheet, Tabs, Textarea
- Fully responsive and accessible

### DevOps
- **Deployment**: Vercel (automatic builds from `main` branch)
- **Database**: Supabase (PostgreSQL, Storage, Auth)
- **Environment**: Production URL: `https://dreamscapecuratedevent.com`

## Tech Stack

- **Framework**: Next.js 16.2.1 (with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with reusable components
  - Accordion
  - Button
  - Calendar
  - Card
  - Carousel
  - Checkbox
  - Input
  - Label
  - Radio Group
  - Select
  - Separator
  - Sheet
  - Tabs
  - Textarea

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22.x or later
- **npm** (comes with Node.js)
- **Supabase account** (for database and storage)

### 1. Clone and Install

```bash
git clone https://github.com/officialmexaly/Dreamscape-Curated-Event.git
cd Dreamscape-Curated-Event
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

```bash
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000 # or your production URL

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000 # or your production URL

# Email (Resend)
RESEND_API_KEY=re_your_api_key

# Google Calendar (optional)
GOOGLE_CALENDAR_CLIENT_EMAIL=your-email@gmail.com
```

### 3. Database Setup

Run the media bucket setup script:

```bash
npm run storage:setup
```

This will create the necessary storage bucket in Supabase.

### 4. Run Development Server

```bash
npm run dev --webpack
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Admin Account

Visit `/admin/setup` to create your admin account.

## 📁 Project Structure

```
dreamscape-curved-event/
├── app/                           # Next.js App Router pages
│   ├── (app)/                     # Admin panel routes
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── content/              # Content management
│   │   ├── blog/                 # Blog/portfolio management
│   │   ├── services/             # Services management
│   │   ├── media/                # Media library
│   │   ├── inquiries/            # Inquiry management
│   │   ├── settings/             # Site settings
│   │   ├── login/                # Admin login
│   │   └── setup/                # Initial setup
│   ├── about/                    # About page
│   ├── blog/                     # Blog listing page
│   ├── blog/[slug]/              # Individual blog post
│   ├── contact/                  # Contact page with inquiry form
│   ├── consultation/             # Consultation page
│   ├── consultation-editorial/   # Consultation with calendar
│   ├── faq/                      # FAQ page
│   ├── love-notes/               # Love notes/testimonials
│   ├── portfolio/                # Portfolio listing
│   ├── portfolio/[slug]/         # Individual portfolio item
│   ├── services/                 # Services page
│   └── page.tsx                  # Homepage
├── src/
│   ├── admin/                     # Admin panel components
│   │   ├── pages/                # Admin page components
│   │   ├── providers/             # React Context providers
│   │   └── toast/                 # Toast notification system
│   ├── components/
│   │   ├── pages/                # Page-specific components
│   │   │   ├── AboutPage.tsx
│   │   │   ├── BlogPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   ├── FAQPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   └── ServicesPage.tsx
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── accordion/
│   │   │   ├── button/
│   │   │   ├── calendar/
│   │   │   ├── card/
│   │   │   ├── input/
│   │   │   ├── sheet/
│   │   │   └── ... (30+ components)
│   │   ├── Footer.tsx              # Site footer
│   │   ├── InquiryForm.tsx        # Comprehensive inquiry form
│   │   ├── Navigation.tsx         # Site navigation with mobile menu
│   │   └── ScrollReveal.tsx       # Scroll animation wrapper
│   ├── lib/                      # Utility libraries
│   │   ├── supabase*.ts          # Supabase clients
│   │   ├── cached-*.ts           # Data fetching with SWR
│   │   ├── password.ts            # Password hashing
│   │   ├── audit-log.ts           # Security audit logging
│   │   └── user-service.ts        # User management
│   └── hooks/                     # Custom React hooks
├── scripts/                       # Utility scripts
│   ├── migrate-content-to-db.ts # Content migration
│   └── storage scripts
├── public/                        # Static assets
│   ├── logo.png
│   └── media/                     # Uploaded images
├── auth.ts                        # NextAuth configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── package.json                   # Dependencies
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
dreamscrap/
├── app/                      # Next.js App Router pages
│   ├── about/               # About page
│   ├── consultation/        # Consultation booking page
│   ├── consultation-editorial/
│   ├── contact/             # Contact page
│   ├── love-notes/          # Testimonials page
│   ├── portfolio/           # Portfolio pages
│   └── services/            # Services page
├── src/
│   ├── components/
│   │   ├── pages/          # Page-specific components
│   │   ├── ui/             # Reusable UI components
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── ScrollReveal.tsx
│   └── lib/                # Utility functions
├── public/                  # Static assets
└── tailwind.config.js       # Tailwind configuration
```

## Key Features

### Interactive Consultation Booking
- Calendar-based date selection
- Real-time availability checking
- Time slot selection
- Multi-step form with tabs
- File upload support

### Portfolio System
- Dynamic routing for portfolio items
- Individual story pages for each event
- Responsive image galleries

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Smooth animations and transitions


## 📜 Available Scripts

```bash
# Development
npm run dev --webpack          # Start dev server with webpack (recommended)
npm run dev:low-ram          # Start dev server with limited RAM

# Production
npm run build                 # Build for production
npm start                     # Start production server

# Code Quality
npm run lint:check            # Check linting issues
npm run lint                  # Fix linting issues automatically
npm run typecheck             # Run TypeScript type checking

# Analysis
npm run analyze               # Analyze bundle size
npm run lighthouse            # Run Lighthouse performance test

# Database/Storage
npm run storage:setup         # Setup Supabase storage bucket
npm run storage:migrate        # Migrate media to Supabase storage
npm run storage:sync           # Sync new media to Supabase
```

## 🔐 Admin Panel

### Access Admin Panel
- URL: `/admin` or `/admin/dashboard`
- Default credentials are set during `/admin/setup`

### Features
- **Content Management**: Edit all page content in real-time
- **Blog/Portfolio**: Full CRUD with image uploads
- **Services**: Manage service offerings and pricing
- **Media Library**: Upload and organize images
- **Inquiries**: View and respond to event inquiries
- **Settings**: Configure site-wide settings
- **Users**: Manage admin users and permissions

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Failed login attempt tracking
- Account lockout after multiple failed attempts
- 30-day session duration

## 🚀 Deployment

### Vercel Deployment

This project is configured for Vercel deployment:

1. **Automatic Builds**: Vercel automatically builds from the `main` branch
2. **Production URL**: `https://dreamscapecuratedevent.com`
3. **Environment Variables**: Set these in Vercel dashboard:
   ```
   NEXT_PUBLIC_APP_URL=https://dreamscapecuratedevent.com
   NEXTAUTH_URL=https://dreamscapecuratedevent.com
   AUTH_SECRET
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   RESEND_API_KEY
   ```

### Manual Deployment

To deploy manually:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod
```

### Branch Strategy
- **`main`**: Production branch (auto-deploys to production)
- **`dev`**: Development branch (for testing new features)

## 🎨 Brand Colors

### Primary Colors
- **Deep Purple**: `#40153F` - Main accent color
- **Pink/Magenta**: `#C66493` - Secondary accent

### Supporting Colors
- **Orange**: `#F47C20`
- **Yellow**: `#E7C84A`
- **Green**: `#5C9A68`

### Neutrals
- **Dark**: `#211B25` - Text and headings
- **Gray**: `#756B73` - Secondary text
- **Light**: `#FCFAF7` - Backgrounds

## 📱 Key Features Highlight

### Mobile Responsive
- All pages fully responsive
- Hamburger menu with smooth animations
- Touch-optimized buttons and interactions
- Optimized loading performance

### Performance
- SWR for intelligent data caching
- Image optimization with Next.js Image component
- Static page generation where possible
- Lazy loading for better performance

### User Experience
- Smooth scroll animations
- Loading skeletons for better perceived performance
- Instant admin login redirect
- Comprehensive inquiry form with validation
- Calendly integration for easy booking

## License

© 2026 Dreamscape Curated Events. All rights reserved.

