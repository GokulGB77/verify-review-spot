
import { supabase } from '@/integrations/supabase/client';

export const uploadFileToStorage = async (file: File, userId: string): Promise<string> => {
  if (!userId) throw new Error('User not authenticated');
  
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  
  console.log('Attempting to upload file:', fileName, 'to review-proofs bucket');
  
  // Upload the file directly to the existing bucket
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('review-proofs')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error details:', {
      message: uploadError.message,
      error: uploadError
    });
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  if (!uploadData?.path) {
    throw new Error('Upload succeeded but no path returned');
  }

  console.log('File uploaded successfully to:', uploadData.path);
  return uploadData.path;
};
