const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = '.env.local';
const envFile = fs.readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let serviceRoleKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    serviceRoleKey = line.split('=')[1].trim();
  }
});

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedActualContent() {
  console.log('Starting seed for ACTUAL CMS content and schemas...');

  // Ensure insights page exists
  await supabase.from('cms_pages').upsert([{ slug: 'insights', title: 'Insights' }], { onConflict: 'slug' });

  const sections = [
    // ---------------------------------------------------------
    // ABOUT
    // ---------------------------------------------------------
    {
      section_key: 'about_hero',
      page_slug: 'about',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ],
      published_content: {
        eyebrow: 'About Lubb al-Mandūmah',
        title: 'The Ecosystem Developers',
        subtitle: 'LΛM is the parent technology company behind an expanding ecosystem of business software, SaaS, platforms, and enterprise applications.'
      }
    },
    {
      section_key: 'about_intro',
      page_slug: 'about',
      name: 'Who We Are & What We Build',
      order_index: 20,
      content_schema: [
        { name: 'who_we_are_title', label: 'Who We Are Title', type: 'text' },
        { name: 'who_we_are_desc', label: 'Who We Are Description', type: 'textarea' },
        { name: 'what_we_build_title', label: 'What We Build Title', type: 'text' },
        { name: 'what_we_build_desc', label: 'What We Build Description', type: 'textarea' }
      ],
      published_content: {
        who_we_are_title: 'Who We Are',
        who_we_are_desc: 'Lubb al-Mandūmah (LΛM) is an engineering and technology holding entity focused on solving complex operational challenges. We operate behind the scenes, providing the foundational code, architecture, and compliance standards that allow businesses to operate seamlessly on a global scale.',
        what_we_build_title: 'What We Build',
        what_we_build_desc: 'Our portfolio spans multiple domains, from core enterprise resource planning (ATOM) to highly restricted institutional governance systems (MAAMS) and specialized B2B software as a service (AimHighSERP). We do not build disjointed applications; we build unified platforms.'
      }
    },
    {
      section_key: 'about_philosophy',
      page_slug: 'about',
      name: 'Ecosystem Philosophy',
      order_index: 30,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'main_quote', label: 'Main Quote', type: 'textarea' },
        {
          name: 'pillars',
          label: 'Pillars',
          type: 'array',
          fields: [
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' }
          ]
        }
      ],
      published_content: {
        title: 'Our Ecosystem Philosophy',
        main_quote: 'We believe that the future of enterprise software is not a collection of isolated tools, but a synchronized ecosystem of interoperable nodes.',
        pillars: [
          { title: 'Single Identity', description: 'A unified identity layer (LΛM ID) powers authentication across all subsidiary products, ensuring cross-platform security.' },
          { title: 'Predictable Scaling', description: 'By sharing core infrastructural elements, new products can be spun up, tested, and deployed at unprecedented speeds.' }
        ]
      }
    },
    {
      section_key: 'about_future',
      page_slug: 'about',
      name: 'Security & Future',
      order_index: 40,
      content_schema: [
        { name: 'security_title', label: 'Security Title', type: 'text' },
        { name: 'security_desc', label: 'Security Description', type: 'textarea' },
        { name: 'future_title', label: 'Future Title', type: 'text' },
        { name: 'future_desc', label: 'Future Description', type: 'textarea' }
      ],
      published_content: {
        security_title: 'Security & Trust',
        security_desc: 'Because we serve diplomatic missions, financial institutions, and global enterprises, security is not an afterthought—it is the bedrock of our code. From 256-bit AES encryption to strict compliance frameworks and zero-trust internal architecture, LΛM protects data sovereignty at all costs.',
        future_title: 'Future Direction',
        future_desc: 'We continue to expand our product registry into new verticals where legacy software still dictates inefficient workflows. Our roadmap includes further development into AI-driven predictive analytics and localized compliance modules tailored for emerging markets.'
      }
    },
    {
      section_key: 'about_cta',
      page_slug: 'about',
      name: 'Call to Action',
      order_index: 50,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'button_text', label: 'Button Text', type: 'text' },
        { name: 'button_link', label: 'Button Link', type: 'text' }
      ],
      published_content: {
        title: 'Join the Ecosystem',
        description: 'We are continually seeking exceptional engineers, architects, and strategic thinkers to contribute to the LΛM core and our subsidiary platforms.',
        button_text: 'View Careers & Collaborations',
        button_link: '/about/careers'
      }
    },

    // ---------------------------------------------------------
    // CAREERS
    // ---------------------------------------------------------
    {
      section_key: 'careers_hero',
      page_slug: 'careers',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ],
      published_content: {
        eyebrow: 'Careers at LΛM',
        title: 'Engineer the Ecosystem',
        subtitle: 'We are looking for exceptional talent to help architect, build, and scale the foundational platforms that power modern enterprises.'
      }
    },
    {
      section_key: 'careers_why',
      page_slug: 'careers',
      name: 'Why LAM',
      order_index: 20,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'main_text', label: 'Main Text', type: 'textarea' },
        {
          name: 'pillars',
          label: 'Pillars',
          type: 'array',
          fields: [
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' }
          ]
        }
      ],
      published_content: {
        title: 'Why LΛM?',
        main_text: 'Working at Lubb al-Mandūmah means operating at the nexus of multiple technological disciplines. Our engineers don\'t just maintain isolated applications; they build interoperable platforms. We offer an environment where technical excellence is the baseline, and where architectural decisions impact multiple industries simultaneously.',
        pillars: [
          { title: 'Uncompromising Standards', description: 'We prioritize clean, maintainable, and highly secure code above rapid, fragile feature delivery.' },
          { title: 'Ecosystem Impact', description: 'Your work on a core module—like the LΛM ID authentication layer—will instantly benefit every platform within our registry.' },
          { title: 'Deep Autonomy', description: 'We hire brilliant individuals and get out of their way. We measure outcomes, not arbitrary processes.' }
        ]
      }
    },
    {
      section_key: 'careers_internships',
      page_slug: 'careers',
      name: 'Internships & Collaborations',
      order_index: 30,
      content_schema: [
        { name: 'internship_title', label: 'Internship Title', type: 'text' },
        { name: 'internship_desc', label: 'Internship Description', type: 'textarea' },
        { name: 'cta_title', label: 'CTA Title', type: 'text' },
        { name: 'cta_desc', label: 'CTA Description', type: 'textarea' },
        { name: 'button_text', label: 'Button Text', type: 'text' },
        { name: 'button_link', label: 'Button Link', type: 'text' }
      ],
      published_content: {
        internship_title: 'Internships & Collaborations',
        internship_desc: 'LΛM frequently collaborates with leading academic institutions and research bodies. If you are seeking a highly technical internship or wish to propose a research collaboration regarding enterprise architecture or digital security, we want to hear from you.',
        cta_title: 'Submit Your Details',
        cta_desc: 'Send us your CV, portfolio, or GitHub profile. We review all proactive applications.',
        button_text: 'Submit Application',
        button_link: '/contact?subject=Careers'
      }
    },

    // ---------------------------------------------------------
    // PARTNERS
    // ---------------------------------------------------------
    {
      section_key: 'partners_hero',
      page_slug: 'partners',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ],
      published_content: {
        eyebrow: 'Partners & Alliances',
        title: 'Ecosystem Integration',
        subtitle: 'LΛM partners with leading infrastructure providers, hardware manufacturers, and specialized agencies to deliver end-to-end solutions.'
      }
    },
    {
      section_key: 'partners_cta',
      page_slug: 'partners',
      name: 'Partnership CTA',
      order_index: 20,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'button_text', label: 'Button Text', type: 'text' },
        { name: 'button_link', label: 'Button Link', type: 'text' }
      ],
      published_content: {
        title: 'Become a Partner',
        description: 'Whether you are a hardware manufacturer looking to integrate with PointO, or a digital agency seeking to leverage AimHighSERP, we are open to strategic alliances.',
        button_text: 'Apply for Partnership',
        button_link: '/contact?subject=Partnership'
      }
    },

    // ---------------------------------------------------------
    // CONTACT
    // ---------------------------------------------------------
    {
      section_key: 'contact_hero',
      page_slug: 'contact',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ],
      published_content: {
        eyebrow: 'Get in Touch',
        title: 'Contact LΛM',
        subtitle: 'Reach out to our global teams for corporate inquiries, partnership opportunities, or technical support.'
      }
    },
    {
      section_key: 'contact_offices',
      page_slug: 'contact',
      name: 'Global Offices',
      order_index: 20,
      content_schema: [
        {
          name: 'offices',
          label: 'Offices',
          type: 'array',
          fields: [
            { name: 'city', label: 'City', type: 'text' },
            { name: 'address', label: 'Address', type: 'textarea' },
            { name: 'phone', label: 'Phone', type: 'text' },
            { name: 'email', label: 'Email', type: 'text' }
          ]
        }
      ],
      published_content: {
        offices: [
          { city: 'Dubai, UAE', address: 'Level 41, Emirates Towers\nSheikh Zayed Road\nDubai, United Arab Emirates', phone: '+971 4 000 0000', email: 'mena@lamweb.com' },
          { city: 'London, UK', address: '1 Canada Square\nCanary Wharf\nLondon E14 5AB, United Kingdom', phone: '+44 20 0000 0000', email: 'europe@lamweb.com' },
          { city: 'Singapore', address: 'Marina Bay Financial Centre\nTower 1\nSingapore 018981', phone: '+65 6000 0000', email: 'apac@lamweb.com' }
        ]
      }
    },

    // ---------------------------------------------------------
    // INDEX HEROES
    // ---------------------------------------------------------
    {
      section_key: 'products_hero',
      page_slug: 'products',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ],
      published_content: {
        eyebrow: 'Software Registry',
        title: 'Platform Ecosystem',
        subtitle: 'Discover our interconnected suite of enterprise software, operational platforms, and specialized B2B SaaS.'
      }
    },
    {
      section_key: 'solutions_hero',
      page_slug: 'solutions',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ],
      published_content: {
        eyebrow: 'Strategic Solutions',
        title: 'Solving Complexity',
        subtitle: 'Our platforms are designed to address profound operational challenges across diverse business domains.'
      }
    },
    {
      section_key: 'industries_hero',
      page_slug: 'industries',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ],
      published_content: {
        eyebrow: 'Industries Served',
        title: 'Global Impact',
        subtitle: 'LΛM technology underpins operations in highly regulated, complex, and high-velocity sectors.'
      }
    },
    {
      section_key: 'insights_hero',
      page_slug: 'insights',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ],
      published_content: {
        eyebrow: 'Research & Strategy',
        title: 'LΛM Insights',
        subtitle: 'Technical perspectives, architectural deep-dives, and strategic research from our engineering and strategy teams.'
      }
    },
    {
      section_key: 'demo_hero',
      page_slug: 'request-demo',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ],
      published_content: {
        eyebrow: 'Enterprise Engagement',
        title: 'Request a Demo',
        subtitle: 'Experience the power of LΛM platforms. Schedule a personalized walkthrough with our solutions architects.'
      }
    }
  ];

  // Process sections: For each section, set draft_content = published_content
  for (const s of sections) {
    s.draft_content = s.published_content;
  }

  const { error: sectionsError } = await supabase.from('cms_sections').upsert(sections, { onConflict: 'section_key' });
  if (sectionsError) {
    console.error('Error inserting sections:', sectionsError);
    return;
  }
  console.log('Successfully seeded ACTUAL website content and schema definitions into CMS!');
}

seedActualContent();
