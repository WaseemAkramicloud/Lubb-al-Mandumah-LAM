import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx > 0) process.env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim()
    }
  })
}

import { getCmsPage } from '../lib/cms/client'
import { getProductsByCategory, getProductById } from '../lib/config/products'
import { getSupabaseAdmin } from '../lib/supabase/admin'

async function testCmsLiveBinding() {
  console.log('===========================================================')
  console.log('TESTING CMS LIVE BINDING & PRODUCT CATEGORY INTEGRATION')
  console.log('===========================================================')

  const supabase = getSupabaseAdmin()

  // --- TEST A: HOMEPAGE HEADING CMS BINDING ---
  console.log('\n📌 TEST A: Homepage Heading CMS Binding...')
  const originalIntro = await getCmsPage('home')
  const origIntroTitle = (originalIntro['home_intro']?.title as string) || "FROM ENTERPRISE SYSTEMS TO EVERYDAY MOBILE TOOLS"

  const testIntroContent = {
    ...(originalIntro['home_intro'] || {}),
    title: "TEST HEADING - ECOSYSTEM CORE SYSTEMS"
  }

  // Update published_content directly as admin to simulate publish
  const { error: errA } = await supabase
    .from('cms_sections')
    .update({ published_content: testIntroContent, draft_content: testIntroContent })
    .eq('section_key', 'home_intro')

  if (errA) throw new Error(`Test A update failed: ${errA.message}`)

  const fetchedIntro = await getCmsPage('home')
  console.log('   Fetched Home Intro Title:', fetchedIntro['home_intro']?.title)

  if (fetchedIntro['home_intro']?.title === "TEST HEADING - ECOSYSTEM CORE SYSTEMS") {
    console.log('✅ TEST A PASSED: Live public homepage dynamically rendered updated CMS heading!')
  } else {
    throw new Error(`TEST A FAILED: Expected updated title, got: ${fetchedIntro['home_intro']?.title}`)
  }

  // Restore original heading
  const restoredIntroContent = {
    ...(originalIntro['home_intro'] || {}),
    title: origIntroTitle
  }
  await supabase
    .from('cms_sections')
    .update({ published_content: restoredIntroContent, draft_content: restoredIntroContent })
    .eq('section_key', 'home_intro')
  console.log('   Restored original Homepage Intro heading.')


  // --- TEST B: PRODUCT CATEGORY & DESCRIPTION CMS BINDING ---
  console.log('\n📌 TEST B: Product Category & Description CMS Binding...')
  const testDesc = "VERIFIED CMS LIVE BINDING DESCRIPTION FOR ATOM"

  const { error: errB } = await supabase
    .from('cms_products')
    .update({ category: 'SaaS', description: testDesc, status: 'published' })
    .eq('slug', 'atom')

  if (errB) throw new Error(`Test B update failed: ${errB.message}`)

  const saasProducts = await getProductsByCategory('SaaS')
  const atomProduct = await getProductById('atom')

  console.log('   Fetched SaaS Category Count:', saasProducts.length)
  console.log('   Fetched ATOM Description:', atomProduct?.description)
  console.log('   Fetched ATOM Category:', atomProduct?.category)

  if (atomProduct?.category === 'SaaS' && atomProduct?.description === testDesc) {
    console.log('✅ TEST B PASSED: Product category and description dynamically reflected live CMS updates!')
  } else {
    throw new Error(`TEST B FAILED: Expected category SaaS & updated desc, got category: ${atomProduct?.category}, desc: ${atomProduct?.description}`)
  }

  // Restore original ATOM description
  const origAtomDesc = "A comprehensive ERP and operations platform built for modern enterprises — covering inventory, procurement, sales, finance and more."
  await supabase
    .from('cms_products')
    .update({ category: 'SaaS', description: origAtomDesc })
    .eq('slug', 'atom')
  console.log('   Restored original ATOM description.')


  // --- TEST C: PUBLIC IMAGE CMS BINDING ---
  console.log('\n📌 TEST C: Public Image CMS Binding...')
  const originalHero = await getCmsPage('home')
  const testHeroContent = {
    ...(originalHero['home_hero'] || {}),
    slides: [
      { src: "/images/slider/slider-02-building-exterior.jpg", alt: "Test Building Exterior Image" }
    ]
  }

  const { error: errC } = await supabase
    .from('cms_sections')
    .update({ published_content: testHeroContent, draft_content: testHeroContent })
    .eq('section_key', 'home_hero')

  if (errC) throw new Error(`Test C update failed: ${errC.message}`)

  const fetchedHero = await getCmsPage('home')
  const slides = fetchedHero['home_hero']?.slides as any[]
  console.log('   Fetched Hero Slides:', slides)

  if (slides && slides.length === 1 && slides[0].src === "/images/slider/slider-02-building-exterior.jpg") {
    console.log('✅ TEST C PASSED: Public image slider dynamically rendered updated CMS image path!')
  } else {
    throw new Error(`TEST C FAILED: Unexpected hero slides output: ${JSON.stringify(slides)}`)
  }

  // Restore original hero slides
  const defaultSlides = [
    { src: "/images/slider/slider-01-boardroom-logo-wall.jpg", alt: "LΛM Boardroom with logo wall" },
    { src: "/images/slider/slider-02-building-exterior.jpg", alt: "LΛM Headquarters exterior" },
    { src: "/images/slider/slider-03-conference-room.jpg", alt: "LΛM Conference Room" },
    { src: "/images/slider/slider-04-reception-lobby.jpg", alt: "LΛM Reception Lobby" }
  ]
  const restoredHeroContent = {
    ...(originalHero['home_hero'] || {}),
    slides: defaultSlides
  }
  await supabase
    .from('cms_sections')
    .update({ published_content: restoredHeroContent, draft_content: restoredHeroContent })
    .eq('section_key', 'home_hero')
  console.log('   Restored original Homepage Hero slider configuration.')

  console.log('\n🎉 ALL CMS LIVE BINDING TESTS PASSED 100% CLEANLY!')
}

testCmsLiveBinding().catch(err => {
  console.error('❌ CMS TEST FAILED:', err)
  process.exit(1)
})
