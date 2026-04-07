export const mockData = {
  events: [
  {
    id: '1',
    title: 'The Sterling Wedding',
    date: '2025-06-15',
    category: 'Wedding',
    status: 'Published',
    image:
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'Vogue Summer Gala',
    date: '2025-07-22',
    category: 'Brand Experience',
    status: 'Published',
    image:
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    title: 'Aurelia 40th Birthday',
    date: '2025-08-10',
    category: 'Private Celebration',
    status: 'Draft',
    image:
    'https://images.unsplash.com/photo-1530103862676-de8892b07439?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    title: 'The Kensington Nuptials',
    date: '2025-09-05',
    category: 'Wedding',
    status: 'Published',
    image:
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800'
  }],

  services: [
  {
    id: '1',
    title: 'Luxury Weddings',
    description: 'Full-service planning and design for your special day.',
    icon: 'Heart',
    image:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    features: ['Venue Selection', 'Vendor Management', 'Event Design']
  },
  {
    id: '2',
    title: 'Private Celebrations',
    description:
    'Curated experiences for milestones and intimate gatherings.',
    icon: 'GlassWater',
    image:
    'https://images.unsplash.com/photo-1530103862676-de8892b07439?auto=format&fit=crop&q=80&w=800',
    features: ['Custom Menus', 'Entertainment', 'Thematic Decor']
  },
  {
    id: '3',
    title: 'Brand Experiences',
    description: 'Elevated corporate events and product launches.',
    icon: 'Briefcase',
    image:
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800',
    features: [
    'Brand Integration',
    'PR Coordination',
    'Immersive Activations']

  }],

  blogPosts: [
  {
    id: '1',
    title: "Pearl & Donald's Wedding",
    subtitle:
    'A beautifully curated destination wedding experience designed to reflect both culture and sophistication.',
    author: 'Eleanor Vance',
    date: '2025-10-14',
    status: 'Published',
    category: 'Wedding',
    location: 'Dallas, Texas',
    excerpt:
    'From the early planning stages to final execution, Dreamscape managed every detail with precision...',
    image:
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
    contentBlocks: [
    {
      id: 'b1',
      type: 'text',
      content:
      'From the early planning stages to final execution, Dreamscape managed every detail with precision, ensuring a seamless flow across the celebration. The event featured intentional design elements, coordinated vendor execution, and an elevated guest experience that felt effortless from start to finish.'
    },
    {
      id: 'b2',
      type: 'image',
      content:
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200',
      caption:
      'The stunning table settings featuring custom floral arrangements.'
    },
    {
      id: 'b3',
      type: 'heading',
      level: 'h2',
      content: 'A Vision Brought to Life'
    },
    {
      id: 'b4',
      type: 'text',
      content:
      'The couple wanted a celebration that felt both grand and intimately personal. We worked closely with them to select a color palette that complemented the natural beauty of the venue while adding touches of modern luxury.'
    },
    {
      id: 'b5',
      type: 'quote',
      content:
      'Dreamscape Curated Events made our wedding day absolutely flawless. Every detail was perfect and we could not have asked for a better team.'
    },
    {
      id: 'b6',
      type: 'image',
      content:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
      caption: 'The bride and groom sharing a quiet moment.'
    }]

  },
  {
    id: '2',
    title: 'Designing a Sensory Brand Experience',
    subtitle: 'How we created an immersive product launch for TechCorp.',
    author: 'Marcus Thorne',
    date: '2025-10-15',
    status: 'Draft',
    category: 'Corporate',
    location: 'San Francisco, CA',
    excerpt:
    'A deep dive into the strategy and execution behind our latest corporate brand activation.',
    image:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    contentBlocks: [
    {
      id: 'b1',
      type: 'text',
      content:
      'Corporate events are no longer just about presentations and networking. Today, they are about creating a memorable brand experience that engages all five senses.'
    },
    { id: 'b2', type: 'heading', level: 'h2', content: 'The Concept' },
    {
      id: 'b3',
      type: 'text',
      content:
      "For TechCorp's latest product launch, we designed an environment that reflected their innovative spirit. From custom lighting to curated soundscapes, every element was intentional."
    }]

  },
  {
    id: '3',
    title: 'The Art of the Intimate Dinner Party',
    subtitle: 'Elevating small gatherings with thoughtful details.',
    author: 'Eleanor Vance',
    date: '2025-11-02',
    status: 'Scheduled',
    category: 'Private Events',
    location: 'Beverly Hills, CA',
    excerpt:
    'Discover how to make your next private dinner party unforgettable.',
    image:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200',
    contentBlocks: [
    {
      id: 'b1',
      type: 'text',
      content:
      'There is something incredibly special about an intimate dinner party. It allows for deeper connections and a more personalized guest experience.'
    }]

  }],

  inquiries: [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    eventType: 'Wedding',
    date: '2025-10-20',
    status: 'New'
  },
  {
    id: '2',
    name: 'Michael Chang',
    email: 'm.chang@techcorp.com',
    eventType: 'Brand Experience',
    date: '2025-10-19',
    status: 'Contacted'
  },
  {
    id: '3',
    name: 'Emma Thompson',
    email: 'emma.t@example.com',
    eventType: 'Private Celebration',
    date: '2025-10-15',
    status: 'Booked'
  },
  {
    id: '4',
    name: 'David & Lisa',
    email: 'davidlisa2026@example.com',
    eventType: 'Wedding',
    date: '2025-10-10',
    status: 'Closed'
  },
  {
    id: '5',
    name: 'Chloe Dubois',
    email: 'chloe.d@fashionbrand.com',
    eventType: 'Brand Experience',
    date: '2025-10-21',
    status: 'New'
  }],

  media: [
  {
    id: '1',
    name: 'hero-bg-1.jpg',
    size: '2.4 MB',
    date: '2025-09-01',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    name: 'wedding-table.jpg',
    size: '1.8 MB',
    date: '2025-09-05',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    name: 'corporate-gala.jpg',
    size: '3.1 MB',
    date: '2025-09-10',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    name: 'floral-arrangement.jpg',
    size: '1.5 MB',
    date: '2025-09-15',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    name: 'champagne-toast.jpg',
    size: '2.0 MB',
    date: '2025-09-20',
    url: 'https://images.unsplash.com/photo-1530103862676-de8892b07439?auto=format&fit=crop&q=80&w=800'
  }],

  siteContent: {
    hero: [
    {
      id: '1',
      headline: 'More Than Events.',
      subtext: 'We Curate Experiences.',
      cta: 'Book a Consultation',
      image:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
    }],

    about: {
      title: 'Our Story',
      content:
      'Dreamscape Curated Events was founded on the belief that every celebration should be a masterpiece. We blend meticulous planning with visionary design to create unforgettable moments.'
    },
    testimonials: [
    {
      id: '1',
      name: 'Sarah & James',
      quote:
      'They made our wedding day absolutely flawless. Every detail was perfect.',
      eventType: 'Wedding'
    },
    {
      id: '2',
      name: 'TechCorp Inc.',
      quote:
      'The product launch exceeded all expectations. A truly immersive brand experience.',
      eventType: 'Brand Experience'
    }]

  },
  settings: {
    companyName: 'Dreamscape Curated Events',
    email: 'hello@dreamscapecuratedevent.com',
    phone: '+1 (555) 123-4567',
    address: '123 Luxury Lane, Beverly Hills, CA 90210',
    instagram: '@dreamscape_events',
    facebook: '/dreamscapeevents',
    metaTitle: 'Dreamscape Curated Events | Luxury Event Planning',
    metaDescription:
    'Luxury weddings, private celebrations, and elevated brand experiences thoughtfully designed, seamlessly coordinated, and beautifully executed.'
  }
};