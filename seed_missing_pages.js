const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env variables
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

async function seedMissingPages() {
  console.log('Starting seed for CMS pages and sections...');

  const pages = [
    { slug: 'about', title: 'About Us' },
    { slug: 'products', title: 'Products' },
    { slug: 'solutions', title: 'Solutions' },
    { slug: 'industries', title: 'Industries' },
    { slug: 'partners', title: 'Partners' },
    { slug: 'contact', title: 'Contact Us' },
    { slug: 'request-demo', title: 'Request Demo' },
    { slug: 'careers', title: 'Careers' }
  ];

  const { error: pageError } = await supabase.from('cms_pages').upsert(pages, { onConflict: 'slug' });
  if (pageError) {
    console.error('Error inserting pages:', pageError);
    return;
  }
  console.log('Inserted missing pages.');

  const sections = [
    // About
    {
      section_key: 'about_hero',
      page_slug: 'about',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
        { name: 'bg_image', label: 'Background Image URL', type: 'text' }
      ]
    },
    {
      section_key: 'about_story',
      page_slug: 'about',
      name: 'Our Story',
      order_index: 20,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'content', label: 'Content', type: 'textarea' },
        { name: 'image', label: 'Image URL', type: 'text' }
      ]
    },
    {
      section_key: 'about_leadership',
      page_slug: 'about',
      name: 'Leadership Team',
      order_index: 30,
      content_schema: [
        { name: 'title', label: 'Section Title', type: 'text' },
        {
          name: 'members',
          label: 'Team Members',
          type: 'array',
          fields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'role', label: 'Role', type: 'text' },
            { name: 'bio', label: 'Short Bio', type: 'textarea' },
            { name: 'photo', label: 'Photo URL', type: 'text' }
          ]
        }
      ]
    },
    // Products
    {
      section_key: 'products_hero',
      page_slug: 'products',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ]
    },
    // Solutions
    {
      section_key: 'solutions_hero',
      page_slug: 'solutions',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ]
    },
    // Industries
    {
      section_key: 'industries_hero',
      page_slug: 'industries',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ]
    },
    // Partners
    {
      section_key: 'partners_hero',
      page_slug: 'partners',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ]
    },
    {
      section_key: 'partners_list',
      page_slug: 'partners',
      name: 'Partner Logos',
      order_index: 20,
      content_schema: [
        {
          name: 'logos',
          label: 'Logos',
          type: 'array',
          fields: [
            { name: 'name', label: 'Partner Name', type: 'text' },
            { name: 'logo_url', label: 'Logo URL', type: 'text' }
          ]
        }
      ]
    },
    // Contact
    {
      section_key: 'contact_hero',
      page_slug: 'contact',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ]
    },
    {
      section_key: 'contact_details',
      page_slug: 'contact',
      name: 'Office Locations',
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
      ]
    },
    // Request Demo
    {
      section_key: 'demo_hero',
      page_slug: 'request-demo',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ]
    },
    // Careers
    {
      section_key: 'careers_hero',
      page_slug: 'careers',
      name: 'Hero Section',
      order_index: 10,
      content_schema: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea' }
      ]
    },
    {
      section_key: 'careers_benefits',
      page_slug: 'careers',
      name: 'Benefits',
      order_index: 20,
      content_schema: [
        { name: 'title', label: 'Section Title', type: 'text' },
        {
          name: 'benefits',
          label: 'Perks & Benefits',
          type: 'array',
          fields: [
            { name: 'name', label: 'Benefit Name', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' }
          ]
        }
      ]
    }
  ];

  const { error: sectionsError } = await supabase.from('cms_sections').upsert(sections, { onConflict: 'section_key' });
  if (sectionsError) {
    console.error('Error inserting sections:', sectionsError);
    return;
  }
  console.log('Inserted missing sections.');
  console.log('Done!');
}

seedMissingPages();
