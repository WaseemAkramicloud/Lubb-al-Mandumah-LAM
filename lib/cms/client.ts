import { createClient } from '@/lib/supabase/server'

/**
 * Fetch all published sections for a given page.
 * Returns a dictionary mapped by section_key.
 */
export async function getCmsPage(slug: string): Promise<Record<string, Record<string, unknown>>> {
  try {
    const supabase = await createClient()
    
    // We only need the published content for the public site
    const { data: sections, error } = await supabase
      .from('cms_sections')
      .select('section_key, published_content')
      .eq('page_slug', slug)
      
    if (error || !sections) {
      console.error(`Failed to fetch CMS page ${slug}:`, error)
      return {}
    }
    
    const pageData: Record<string, Record<string, unknown>> = {}
    
    for (const section of sections) {
      // Only include it if published_content is not empty.
      // An empty JSON object {} means it hasn't been published yet.
      if (section.published_content && Object.keys(section.published_content).length > 0) {
        pageData[section.section_key] = section.published_content
      }
    }
    
    return pageData
  } catch (e) {
    console.error(`Exception fetching CMS page ${slug}:`, e)
    return {}
  }
}
