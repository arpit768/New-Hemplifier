/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Product, JournalArticle } from './types';

export const TRANSLATIONS = {
  en: {
    shop: 'Shop',
    about: 'About',
    journal: 'Journal',
    cart: 'Cart',
    search: 'Search',
    view_all: 'View All',
    read_more: 'Read More',
    add_to_cart: 'Add to Cart',
    quick_view: 'Quick View',
    checkout: 'Checkout',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    contact_info: 'Contact Information',
    shipping_address: 'Shipping Address',
    payment: 'Payment',
    back_to_shop: 'Back to Shop',
    order_summary: 'Order Summary',
    remove: 'Remove',
    admin_view: 'Admin View',
    search_placeholder: 'Search...',
    latest_arrivals: 'Latest Arrivals',
    curated: 'Curated',
    philosophy: 'Our Philosophy',
    hero_title: 'Quiet Living.',
    hero_subtitle: 'Technology designed to disappear into your life.',
    explore_shop: 'Explore Shop',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    full_name: 'Full Name',
    sign_in: 'Sign In',
    create_account: 'Create Account',
    no_account: "Don't have an account?",
    have_account: "Already have an account?",
    my_profile: "My Profile",
    order_history: "Order History",
    account_details: "Account Details",
    welcome_back: "Welcome back",
    create_account_title: "Join Hemplifier",
    order_confirmed: 'Order Confirmed',
    thank_you: 'Thank you for your purchase.',
    confirmation_email: 'We have sent a confirmation email to your inbox.',
    continue_shopping: 'Continue Shopping',
    processing: 'Processing...',
    pay_now: 'Pay Now'
  },
  ne: {
    shop: 'पसल',
    about: 'हाम्रो बारेमा',
    journal: 'लेख',
    cart: 'झोला',
    search: 'खोज्नुहोस्',
    view_all: 'सबै हेर्नुहोस्',
    read_more: 'थप पढ्नुहोस्',
    add_to_cart: 'झोला मा राख्नुहोस्',
    quick_view: 'छिटो हेर्नुहोस्',
    checkout: 'भुक्तानी गर्नुहोस्',
    total: 'जम्मा',
    subtotal: 'उप-जम्मा',
    shipping: 'ढुवानी',
    free: 'नि:शुल्क',
    contact_info: 'सम्पर्क विवरण',
    shipping_address: 'ढुवानी ठेगाना',
    payment: 'भुक्तानी',
    back_to_shop: 'पसलमा फर्कनुहोस्',
    order_summary: 'अर्डर सारांश',
    remove: 'हटाउनुहोस्',
    admin_view: 'एडमिन दृश्य',
    search_placeholder: 'खोज्नुहोस्...',
    latest_arrivals: 'नयाँ आगमन',
    curated: 'विशेष',
    philosophy: 'हाम्रो दर्शन',
    hero_title: 'शान्त जीवन।',
    hero_subtitle: 'प्रविधि जुन तपाईंको जीवनमा हराउँछ।',
    explore_shop: 'पसल अन्वेषण गर्नुहोस्',
    login: 'लग-इन',
    logout: 'लग-आउट',
    register: 'दर्ता गर्नुहोस्',
    email: 'इमेल',
    password: 'पासवर्ड',
    full_name: 'पूरा नाम',
    sign_in: 'साइन इन',
    create_account: 'खाता बनाउनुहोस्',
    no_account: "खाता छैन?",
    have_account: "पहिले नै खाता छ?",
    my_profile: "मेरो प्रोफाइल",
    order_history: "अर्डर इतिहास",
    account_details: "खाता विवरण",
    welcome_back: "स्वागत छ",
    create_account_title: "Hemplifier मा सामेल हुनुहोस्",
    order_confirmed: 'अर्डर पक्का भयो',
    thank_you: 'तपाईंको खरिदका लागि धन्यवाद।',
    confirmation_email: 'हामीले तपाईंको इनबक्समा पुष्टिकरण इमेल पठाएका छौं।',
    continue_shopping: 'किनमेल जारी राख्नुहोस्',
    processing: 'प्रक्रिया हुँदैछ...',
    pay_now: 'अहिले भुक्तानी गर्नुहोस्'
  }
};

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Hemplifier Harmony',
    tagline: 'Listen naturally.',
    description: 'Audio that feels like the open air. Constructed with warm acoustic fabric and recycled sandstone composite.',
    longDescription: 'Experience sound as it was meant to be heard—unconfined and organic. The Hemplifier Harmony headphones feature our proprietary open-air driver technology, encased in a breathable acoustic fabric that adapts to your temperature. The headband is crafted from a recycled sandstone composite, offering a unique, cool-to-the-touch texture that grounds you in the present moment.',
    price: 55000,
    priceUsd: 850,
    salePrice: 49500,
    salePriceUsd: 765,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1524678606372-565ae0f98944?auto=format&fit=crop&q=80&w=1000'
    ],
    features: ['Organic Noise Cancellation', '50h Battery', 'Natural Soundstage']
  },
  {
    id: 'p2',
    name: 'Hemplifier Epoch',
    tagline: 'Moments, not minutes.',
    description: 'A timepiece designed for wellness. Ceramic casing with a strap made from sustainable vegan leather.',
    longDescription: 'Time is not a sequence of numbers, but a flow of moments. The Hemplifier Epoch rethinks the smartwatch interface, using a calm E-Ink hybrid display that mimics paper. It tracks stress through skin temperature and heart rate variability, gently vibrating to remind you to breathe. The ceramic casing is hypoallergenic and smooth, polished by hand for 48 hours.',
    price: 45000,
    priceUsd: 650,
    category: 'Wearable',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000',
    gallery: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1000'
    ],
    features: ['Stress Monitoring', 'E-Ink Hybrid Display', '7-Day Battery']
  },
  {
    id: 'p3',
    name: 'Hemplifier Canvas',
    tagline: 'Capture the warmth.',
    description: 'A display that mimics the properties of paper. Soft on the eyes, vivid in color, and textured to the touch.',
    longDescription: 'Screens shouldn\'t feel like looking into a lightbulb. Hemplifier Canvas uses a matte, nano-etched OLED panel that scatters ambient light, creating a display that looks and feels like high-quality magazine paper. Perfect for reading, sketching, or displaying art, it brings a tactile warmth to your digital life.',
    price: 145000,
    priceUsd: 2200,
    category: 'Mobile',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000',
    gallery: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=1000'
    ],
    features: ['Paper-like OLED', 'Portrait Lens', 'Sandstone Texture']
  },
  {
    id: 'p4',
    name: 'Hemplifier Essence',
    tagline: 'Return to nature.',
    description: 'An air purifier that doubles as a sculpture. Whisper quiet, diffusing subtle natural scents while cleaning your space.',
    longDescription: 'Clean air is the foundation of a clear mind. Hemplifier Essence uses a moss-based bio-filter combined with HEPA technology to scrub pollutants from your home. It gently diffuses natural essential oils—cedar, bergamot, and rain—orchestrated to match the time of day.',
    price: 78000,
    priceUsd: 1100,
    category: 'Home',
    imageUrl: 'https://images.pexels.com/photos/8092420/pexels-photo-8092420.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    gallery: [
        'https://images.pexels.com/photos/8092420/pexels-photo-8092420.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000'
    ],
    features: ['Bio-HEPA Filter', 'Aromatherapy', 'Silent Night Mode']
  },
  {
    id: 'p5',
    name: 'Hemplifier Beam',
    tagline: 'Light that breathes.',
    description: 'Smart circadian lighting that follows the sun. Casts a warm, candle-like glow in the evenings.',
    longDescription: 'Artificial light disrupts our natural rhythms. Hemplifier Beam syncs with your local sunrise and sunset, providing cool, energizing light during the day and transitioning to a warm, amber glow free of blue light in the evening. Controls are touchless; a simple wave of the hand adjusts brightness.',
    price: 32000,
    priceUsd: 450,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=1000',
    gallery: [
        'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1540932296235-d84931b6370b?auto=format&fit=crop&q=80&w=1000'
    ],
    features: ['Circadian Rhythm Sync', 'Warm Dimming', 'Touchless Control']
  },
  {
    id: 'p6',
    name: 'Hemplifier Scribe',
    tagline: 'Thought in motion.',
    description: 'A digital stylus with the friction of graphite. Charges wirelessly when magnetically attached to Hemplifier Canvas.',
    longDescription: 'The connection between hand and brain is sacred. Hemplifier Scribe features a custom elastomer tip that replicates the microscopic friction of graphite on paper. Weighted perfectly for balance, it disappears in your hand, leaving only your thoughts.',
    price: 16500,
    priceUsd: 250,
    category: 'Mobile',
    imageUrl: 'https://images.pexels.com/photos/2647376/pexels-photo-2647376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    gallery: [
        'https://images.pexels.com/photos/2647376/pexels-photo-2647376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        'https://images.unsplash.com/photo-1517260487576-8977430081d3?auto=format&fit=crop&q=80&w=1000'
    ],
    features: ['Zero Latency', 'Textured Tip', 'Wireless Charging']
  },
  {
    id: 'p7',
    name: 'Sindhu Face Cream',
    tagline: 'Moisturize naturally.',
    description: 'A rich, organic face cream crafted with Shea and Chiuri butters. Made in Nepal.',
    longDescription: 'Nourish your skin with the purity of the Himalayas. Sindhu Face Cream is a restorative blend of Shea and Chiuri butters designed to deeply moisturize. Infused with Hemp Seed Oil, Lavender, and Tea Tree essential oils, this cream provides hydration while Vitamin E protects against environmental stressors. 30g/1 oz.',
    price: 5800,
    priceUsd: 85,
    salePrice: 4640,
    salePriceUsd: 68,
    category: 'Wellness',
    imageUrl: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=1000',
    gallery: [
        'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=1000'
    ],
    features: ['Hemp Seed Oil', 'Shea & Chiuri Butter', 'Lavender & Tea Tree EO']
  },
  {
    id: 'p8',
    name: 'Sindhu Hair Oil',
    tagline: 'Grow strong, shine naturally.',
    description: 'Revitalizing rosemary hair oil for strength and shine. 30ml/1.03 FlOz.',
    longDescription: 'Unlock the secret to lustrous, strong hair. This concentrated Rosemary Hair Oil is crafted to stimulate the scalp and promote healthy growth. Its natural formula ensures your hair shines without heavy residue. Crafted by nature in Nepal.',
    price: 4900,
    priceUsd: 75,
    category: 'Wellness',
    imageUrl: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=1000',
    gallery: [
        'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=1000'
    ],
    features: ['Rosemary Extract', 'Scalp Stimulation', 'Natural Shine']
  }
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
    {
        id: 1,
        title: "The Psychology of Texture",
        date: "April 12, 2025",
        excerpt: "Why our fingertips crave natural surfaces in a world of glass and plastic.",
        image: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?auto=format&fit=crop&q=80&w=1000",
        content: `
            <p class="mb-6 first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left text-[#5D5A53]">
                We live in a frictionless world. Our phones are smooth glass, our laptops polished aluminum, our countertops engineered quartz. There is no resistance, no grit, no grain. And yet, our biology craves it.
            </p>
            <p class="mb-8 text-[#5D5A53]">
                The fingertips are among the most densely innervated parts of the human body. They are designed to read the story of an object—its age, its origin, its temperature. When we deny them this input, we experience a subtle form of sensory deprivation.
            </p>
            <blockquote class="border-l-2 border-[#2C2A26] pl-6 italic text-xl text-[#2C2A26] my-10 font-serif">
                "To touch is to know. To feel is to be grounded."
            </blockquote>
            <p class="mb-6 text-[#5D5A53]">
                At Hemplifier, we design for the hand as much as for the eye. We choose materials that have a voice. Sandstone that warms under your palm. Fabric that has a weave you can trace. Wood that remembers the forest.
            </p>
        `,
        comments: [
            { id: 'c1', author: 'Sarah Jenkins', text: 'This resonates so much. I have been feeling this fatigue from smooth glass everywhere.', date: 'April 12, 2025' },
            { id: 'c2', author: 'David Chen', text: 'Beautifully written. The connection between touch and grounding is undeniable.', date: 'April 13, 2025' }
        ]
    },
    {
        id: 2,
        title: "Living with Less",
        date: "March 28, 2025",
        excerpt: "A conversation with architect Hiroshi Nakamura on the art of empty space.",
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000",
        content: `
            <p class="mb-6 text-[#5D5A53]">
                Emptiness is not nothing. In Japanese architecture, the concept of <em>Ma</em> refers to the space between things—the pause that gives shape to the whole.
            </p>
            <p class="mb-8 text-[#5D5A53]">
                "We tend to fill our lives with noise," Nakamura says, sipping tea in his studio overlooking the rain-slicked streets of Kyoto. "We buy more devices to save time, but we end up with less time than ever. True luxury is the absence of intrusion."
            </p>
            <div class="my-12 p-8 bg-[#EBE7DE] font-serif text-[#2C2A26] italic text-center">
                <p>The room is empty</p>
                <p>But full of light.</p>
                <p>The mind is quiet</p>
                <p>But full of thought.</p>
                <p>This is the weight</p>
                <p>Of living with less.</p>
            </div>
            <p class="mb-6 text-[#5D5A53]">
                This philosophy drives every curve of our new collection. We asked ourselves: what can we remove? How much can we take away until only the essential remains?
            </p>
        `,
        comments: []
    },
    {
        id: 3,
        title: "Spring Moodboard",
        date: "March 15, 2025",
        excerpt: "Notes from the design studio: morning mist, wet stone, and pale linen.",
        image: "https://images.unsplash.com/photo-1516834474-48c0abc2a902?auto=format&fit=crop&q=80&w=1000",
        content: `
            <p class="mb-6 text-[#5D5A53]">
                Spring in the studio is a time of awakening. The light shifts from the harsh, low angles of winter to a softer, diffused glow. We find ourselves drawn to paler tones—the grey of wet pavement, the cream of unbleached linen, the dusty green of sage.
            </p>
            <p class="mb-8 text-[#5D5A53]">
                Our moodboard this month is a study in softness. It is about the transition state—neither cold nor hot, neither dark nor bright. It is the dawn of the year.
            </p>
            <div class="my-12 p-8 bg-[#2C2A26] text-[#F5F2EB] font-serif italic text-center">
                <p>Green sprout pushing through</p>
                <p>Grey stone cold against the skin</p>
                <p>The sun warms the air.</p>
            </div>
        `,
        comments: [
            { id: 'c1', author: 'Elena R.', text: 'The color palette is exquisite. So calming.', date: 'March 16, 2025' }
        ]
    }
];

export const BRAND_NAME = 'Hemplifier';
export const PRIMARY_COLOR = 'stone-900'; 
export const ACCENT_COLOR = 'stone-500';