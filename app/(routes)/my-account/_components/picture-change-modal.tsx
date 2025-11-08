"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUploadWrapper from "@/components/image-upload-wrapper";
import { type FileWithPreview } from "@/lib/hooks/useFileUpload";
import { uploadImage } from "@/lib/utils/supabase/uploadImage";
import { toast } from "sonner";
import { Save, X, User } from "lucide-react";

interface PictureChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string | null;
  onImageUpdate: (newImageUrl: string) => void;
  isLoading?: boolean;
}

export function PictureChangeModal({
  isOpen,
  onClose,
  currentImageUrl,
  onImageUpdate,
  isLoading = false,
}: PictureChangeModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = async (files: FileWithPreview[]) => {
    if (files.length === 0) return;

    const fileWithPreview = files[0];
    
    // Extract the actual File object from FileWithPreview
    if (fileWithPreview.file instanceof File) {
      setSelectedFile(fileWithPreview.file);
      // Clear any previously uploaded URL since we have a new file
      setUploadedImageUrl(null);
    } else {
      toast.error("Invalid file type");
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadedImageUrl(currentImageUrl || null);
  };

  const handleSave = async () => {
    if (!selectedFile && !uploadedImageUrl) {
      toast.error("Please select an image");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = uploadedImageUrl;

      // If there&apos;s a selected file, upload it first
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadImage(selectedFile, "profiles");
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
            setUploadedImageUrl(uploadedUrl);
            toast.success("Image uploaded successfully!");
          } else {
            toast.error("Failed to upload image");
            return;
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload image");
          return;
        } finally {
          setIsUploading(false);
        }
      }

      if (finalImageUrl) {
        onImageUpdate(finalImageUrl);
        toast.success("Profile picture updated successfully!");
        handleClose();
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadedImageUrl(currentImageUrl || null);
    onClose();
  };

  const displayImageUrl = selectedFile ? null : uploadedImageUrl;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Change Profile Picture
          </DialogTitle>
          <DialogDescription>
            Upload a new profile picture. Maximum file size is 2MB.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ImageUploadWrapper
            onFilesAdded={handleFileUpload}
            onFileRemove={handleFileRemove}
            isUploading={isUploading}
            uploadedImageUrl={displayImageUrl}
            maxSizeMB={2}
          />
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading || isSubmitting}
            className="cursor-pointer"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isUploading || isSubmitting || (!selectedFile && !uploadedImageUrl)}
            className="cursor-pointer"
          >
            <Save className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}