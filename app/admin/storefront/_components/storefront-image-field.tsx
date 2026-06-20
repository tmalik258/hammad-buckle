"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import ImageUploadWrapper from "@/components/image-upload-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FileWithPreview } from "@/lib/hooks/useFileUpload";
import { uploadImage } from "@/lib/utils/supabase/uploadImage";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  optional?: boolean;
  maxSizeMB?: number;
};

export function StorefrontImageField({
  label,
  value,
  onChange,
  optional = false,
  maxSizeMB = 4,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (files: FileWithPreview[]) => {
      if (files.length === 0) return;

      const fileWithPreview = files[0];
      if (!(fileWithPreview.file instanceof File)) {
        toast.error("Invalid file type");
        return;
      }

      setIsUploading(true);
      try {
        const url = await uploadImage(fileWithPreview.file, "storefront");
        if (url) {
          setUploadedImageUrl(url);
          onChange(url);
          toast.success("Image uploaded");
        } else {
          toast.error("Failed to upload image");
        }
      } catch {
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    setUploadedImageUrl(null);
    onChange("");
  }, [onChange]);

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>{label}</Label>
      <ImageUploadWrapper
        onFilesAdded={handleFileUpload}
        onFileRemove={handleRemove}
        isUploading={isUploading}
        uploadedImageUrl={uploadedImageUrl}
        maxSizeMB={maxSizeMB}
        formImageValue={value}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          optional ? "Or paste an image URL (optional)" : "Or paste an image URL"
        }
        disabled={isUploading}
      />
    </div>
  );
}
