export type BlogPost = {
  id: string;
  title: string;
  location: string;
  category: string;
  date: string;
  img: string;
  desc: string;
  fullStory: string[];
  gallery: string[];
  contentBlocks?: Array<{
    id: string;
    type: 'text' | 'image' | 'heading' | 'quote';
    content: string;
    level?: string;
    caption?: string;
  }>;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'pearl-donald',
    title: "Pearl & Donald's Wedding",
    location: 'Dallas, Texas',
    category: 'Wedding',
    date: 'October 14, 2025',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    desc: 'A beautifully curated destination wedding experience designed to reflect both culture and sophistication.',
    fullStory: [
      'From the early planning stages to final execution, Dreamscape managed every detail with precision, ensuring a seamless flow across the celebration. The event featured intentional design elements, coordinated vendor execution, and an elevated guest experience that felt effortless from start to finish.',
      'This celebration was more than a wedding. It was a fully immersive experience, thoughtfully brought to life from concept to completion.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop'
    ]
  },
  {
    id: 'nneoma-25',
    title: "Nneoma's 25th Birthday",
    location: 'Toronto, Ontario',
    category: 'Celebration',
    date: 'August 22, 2025',
    img: 'https://images.unsplash.com/photo-1530103862676-de8892b07439?q=80&w=2070&auto=format&fit=crop',
    desc: 'An elegant milestone celebration blending modern aesthetics with intimate dining.',
    fullStory: [
      'A milestone birthday designed with intention and elegance. The focus was on creating an intimate yet luxurious atmosphere for close friends and family.',
      "Every detail, from the custom menus to the floral arrangements, was curated to reflect Nneoma's personal style and vision for her 25th year."
    ],
    gallery: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1974&auto=format&fit=crop'
    ]
  },
  {
    id: 'chika-grad',
    title: "Dr. Chika's Graduation",
    location: 'Toronto, Ontario',
    category: 'Celebration',
    date: 'June 10, 2025',
    img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop',
    desc: 'A sophisticated graduation party celebrating academic excellence and new beginnings.',
    fullStory: [
      "Celebrating a monumental achievement required an event that matched the significance of the occasion. Dr. Chika's graduation party was a blend of sophisticated dining and joyous celebration.",
      'The evening flowed seamlessly from formal toasts to a lively reception, perfectly capturing the essence of this major life milestone.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop'
    ]
  },
  {
    id: 'troy-1st',
    title: "Troy's 1st Birthday",
    location: 'Toronto, Ontario',
    category: 'Celebration',
    date: 'May 5, 2025',
    img: 'https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21e?q=80&w=1974&auto=format&fit=crop',
    desc: 'A whimsical yet refined first birthday celebration for family and friends.',
    fullStory: [
      'First birthdays are as much a celebration for the parents as they are for the child. We designed an event that was playful enough for the little ones but sophisticated enough for the adults to enjoy.',
      'The result was a beautiful afternoon filled with joy, laughter, and impeccable design.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop'
    ]
  },
  {
    id: 'amara-bridal-shower',
    title: "Amara's Bridal Shower",
    location: 'Mississauga, Ontario',
    category: 'Private Event',
    date: 'April 18, 2025',
    img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop',
    desc: 'A polished bridal shower layered with warm florals, intimate dining, and feminine details.',
    fullStory: [
      'This bridal shower was designed to feel airy, elegant, and deeply personal. The design direction balanced softness with structure so the room felt styled without losing warmth.',
      'From guest flow to tabletop details, every touchpoint supported a refined afternoon that felt seamless for both the host and the guests.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop'
    ]
  },
  {
    id: 'adeola-brand-dinner',
    title: 'Adeola Brand Dinner',
    location: 'Toronto, Ontario',
    category: 'Brand Event',
    date: 'March 2, 2025',
    img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop',
    desc: 'A luxury brand dinner created to feel intimate, editorial, and highly intentional.',
    fullStory: [
      'The dinner experience was shaped around clean visual storytelling, understated florals, and a guest journey that felt smooth from arrival through final toast.',
      'Dreamscape managed the pacing, room styling, and production details so the event could communicate the brand with clarity and polish.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1974&auto=format&fit=crop'
    ]
  },
  {
    id: 'chioma-baby-shower',
    title: "Chioma's Baby Shower",
    location: 'Brampton, Ontario',
    category: 'Private Event',
    date: 'January 20, 2025',
    img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1974&auto=format&fit=crop',
    desc: 'A soft and elevated baby shower blending calm color, beautiful styling, and joyful celebration.',
    fullStory: [
      'This event centered around comfort, beauty, and a guest experience that felt intimate from the first arrival to the final photograph.',
      'The styling leaned soft and refined, with layered textures and coordinated details that made the room feel complete.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1974&auto=format&fit=crop'
    ]
  }
];

export function getBlogPostById(id: string) {
  return BLOG_POSTS.find((post) => post.id === id);
}
