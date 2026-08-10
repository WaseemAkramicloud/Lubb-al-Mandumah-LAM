'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

export async function uploadMedia(formData: FormData) {
  await requirePermission('media_library', 'create')

  const file = formData.get('file') as File;
  if (!file) throw new Error("No file provided");
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds 5MB limit.");
  }
  
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, WEBP, GIF, and PDF are allowed.");
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized");

  // Format file name
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `uploads/${fileName}`

  // Upload to storage bucket "media"
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error("Storage error:", uploadError);
    throw new Error("Failed to upload file to storage bucket. Ensure the 'media' bucket exists and is public.");
  }

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath)
  const fileUrl = publicUrlData.publicUrl

  // Insert into media_assets table
  const { error: dbError } = await supabase.from('media_assets').insert([{
    file_name: file.name,
    file_url: fileUrl,
    alt_text: formData.get('alt_text') || file.name,
    size_bytes: file.size,
    mime_type: file.type,
    uploaded_by: user.id
  }])

  if (dbError) {
    // Attempt rollback
    await supabase.storage.from('media').remove([filePath])
    throw new Error(dbError.message)
  }

  revalidatePath('/control-panel/modules/media-library')
  return { success: true }
}

export async function deleteMedia(id: string, fileUrl: string) {
  await requirePermission('media_library', 'delete')
  
  const supabase = await createClient()
  
  // Extract path from public URL
  const urlParts = fileUrl.split('/media/')
  if (urlParts.length > 1) {
    const filePath = urlParts[1]
    await supabase.storage.from('media').remove([filePath])
  }

  const { error } = await supabase.from('media_assets').delete().eq('id', id)
  
  if (error) throw new Error(error.message)

  revalidatePath('/control-panel/modules/media-library')
  return { success: true }
}

export async function getMediaAssets() {
  await requirePermission('media_library', 'view')
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}
