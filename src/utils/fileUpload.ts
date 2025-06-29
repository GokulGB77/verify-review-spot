
import { supabase } from '@/integrations/supabase/client';

export const uploadFileToStorage = async (file: File, userId: string): Promise<string> => {
  if (!userId) throw new Error('User not authenticated');
  
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  
  console.log('Attempting to upload file:', fileName, 'to review-proofs bucket');
  
  // First, let's check if the bucket exists and create it if it doesn't
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError);
    throw new Error('Failed to access storage');
  }
  
  const bucketExists = buckets?.some(bucket => bucket.name === 'review-proofs');
  
  if (!bucketExists) {
    console.log('Creating review-proofs bucket');
    const { error: createBucketError } = await supabase.storage.createBucket('review-proofs', {
      public: false
    });
    
    if (createBucketError) {
      console.error('Error creating bucket:', createBucketError);
      throw new Error('Failed to create storage bucket');
    }
  }
  
  // Upload the file
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
