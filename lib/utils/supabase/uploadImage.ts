import { createClient } from "./client";

const supabase = createClient();

export const uploadImage = async (file: File, folderName: string, bucketName: string = "images"): Promise<string | null> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${folderName}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) {
    console.log("Upload error:", error);
    return null;
  }

  // Assuming the bucket is public
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
};
