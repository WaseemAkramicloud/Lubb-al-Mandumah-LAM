import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hasPermission } from '@/lib/auth/permissions'

/**
 * Fetch all published sections for a given page.
 * Returns a dictionary mapped by section_key.
 */
export async function getCmsPage(slug: string, options?: { preview?: boolean }): Promise<Record<string, Record<string, unknown>>> {
  try {
    let supabase: any
    try {
      supabase = await createClient()
    } catch {
      supabase = getSupabaseAdmin()
    }
    
    // We only need the published content for the public site, unless preview is requested
    const { data: sections, error } = await supabase
      .from('cms_sections')
      .select('section_key, published_content, draft_content')
      .eq('page_slug', slug)
      
    if (error || !sections) {
      console.error(`Failed to fetch CMS page ${slug}:`, error)
      return {}
    }
    
    // Check auth for preview
    let allowPreview = false;
    if (options?.preview) {
      try {
        allowPreview = await hasPermission('site_management', 'view');
      } catch {
        allowPreview = false;
      }
    }
    
    const pageData: Record<string, Record<string, unknown>> = {}
    
    for (const section of sections) {
      const content = (allowPreview && section.draft_content && Object.keys(section.draft_content).length > 0) 
        ? section.draft_content 
        : section.published_content;

      // Only include it if content is not empty.
      if (content && Object.keys(content).length > 0) {
        pageData[section.section_key] = content
      }
    }
    
    return pageData
  } catch (e) {
    console.error(`Exception fetching CMS page ${slug}:`, e)
    return {}
  }
}
