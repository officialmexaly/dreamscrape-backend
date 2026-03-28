# Dreamscape Curated Events

A luxury event planning website featuring beautiful design, interactive components, and seamless user experience.

## Features

- **Home Page** - Elegant landing page with scroll-reveal animations
- **About** - Company information and story
- **Services** - Detailed service offerings for event planning
- **Portfolio** - Showcase of past events with individual story pages
- **Love Notes** - Testimonials and client feedback
- **Consultation** - Interactive booking system with calendar integration
- **Contact** - Contact form and information

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

## Getting Started

### Prerequisites

- Node.js 22.x
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

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

## Deployment

This project is deployed on Vercel and automatically builds from the `main` branch.

## License

© 2026 Dreamscape Curated Events. All rights reserved.

