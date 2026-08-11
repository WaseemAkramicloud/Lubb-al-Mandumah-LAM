"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

function sanitize(str: unknown): string {
  if (typeof str !== "string") return "";
  return str.trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Attempt to resolve a free-text product reference to a known product slug.
 * Returns the slug if found, or null if no match.
 */
async function resolveProductSlug(productText: string): Promise<string | null> {
  if (!productText) return null

  const supabase = getSupabaseAdmin()
  
  // Try exact slug match first
  const { data: bySlug } = await supabase
    .from('cms_products')
    .select('slug')
    .ilike('slug', productText)
    .limit(1)
    .single()

  if (bySlug) return bySlug.slug

  // Try name match
  const { data: byName } = await supabase
    .from('cms_products')
    .select('slug')
    .ilike('name', productText)
    .limit(1)
    .single()

  if (byName) return byName.slug

  // Try partial match on slug or name
  const { data: byPartial } = await supabase
    .from('cms_products')
    .select('slug')
    .or(`slug.ilike.%${productText}%,name.ilike.%${productText}%`)
    .limit(1)
    .single()

  if (byPartial) return byPartial.slug

  return null
}

export async function submitContactRequest(formData: FormData) {
  try {
    const supabase = getSupabaseAdmin();
    
    const data = {
      name: sanitize(formData.get("name")),
      email: sanitize(formData.get("email")),
      enquiry_type: sanitize(formData.get("type")),
      message: sanitize(formData.get("message")),
      consent: formData.get("consent") === "true",
    };
    
    // Server-side validation
    if (!data.name || !data.email || !data.enquiry_type || !data.message) {
      return { success: false, error: "Missing required fields." };
    }
    
    if (!isValidEmail(data.email)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    
    if (!data.consent) {
      return { success: false, error: "Privacy consent is required." };
    }

    const { data: insertedRequest, error } = await supabase.from("contact_requests").insert(data).select('id').single();
    
    if (error) {
      console.error("Supabase insert error (contact_requests):", error);
      return { success: false, error: "Failed to submit request. Please try again later." };
    }

    // Resolve product slug from enquiry_type text
    const productSlug = await resolveProductSlug(data.enquiry_type)

    // Dual-write to CRM Leads (with relational product reference)
    await supabase.from("crm_leads").insert({
      source_type: 'contact',
      source_id: insertedRequest.id,
      contact_person: data.name,
      email: data.email,
      interested_product: data.enquiry_type,
      product_slug: productSlug,
      message: data.message,
      status: 'New'
    });

    return { success: true };
  } catch (err) {
    console.error("Unexpected error submitting contact request:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function submitDemoRequest(formData: FormData) {
  try {
    const supabase = getSupabaseAdmin();
    
    const data = {
      name: sanitize(formData.get("name")),
      company: sanitize(formData.get("company")),
      email: sanitize(formData.get("email")),
      phone: sanitize(formData.get("phone")) || null,
      country: sanitize(formData.get("country")),
      company_size: sanitize(formData.get("size")) || null,
      product_of_interest: sanitize(formData.get("product")),
      requirements: sanitize(formData.get("requirements")),
      consent: formData.get("consent") === "true",
    };
    
    // Server-side validation
    if (!data.name || !data.company || !data.email || !data.country || !data.product_of_interest || !data.requirements) {
      return { success: false, error: "Missing required fields." };
    }
    
    if (!isValidEmail(data.email)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    
    if (!data.consent) {
      return { success: false, error: "Privacy consent is required." };
    }

    const { data: insertedDemo, error } = await supabase.from("demo_requests").insert(data).select('id').single();
    
    if (error) {
      console.error("Supabase insert error (demo_requests):", error);
      return { success: false, error: "Failed to submit demo request. Please try again later." };
    }

    // Resolve product slug from product_of_interest text
    const productSlug = await resolveProductSlug(data.product_of_interest)

    // Dual-write to CRM Leads (with relational product reference)
    await supabase.from("crm_leads").insert({
      source_type: 'demo',
      source_id: insertedDemo.id,
      contact_person: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      country: data.country,
      interested_product: data.product_of_interest,
      product_slug: productSlug,
      message: data.requirements,
      status: 'New'
    });

    return { success: true };
  } catch (err) {
    console.error("Unexpected error submitting demo request:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
