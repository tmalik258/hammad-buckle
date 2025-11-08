import { AlertCircleIcon, XIcon, ImageUpIcon } from "lucide-react"
import { type FileWithPreview, useFileUpload } from "@/lib/hooks/useFileUpload"
import Image from "next/image"
import { useCallback } from "react"

interface ImageUploadWrapperProps {
  onFilesAdded: (files: FileWithPreview[]) => void
  onFileRemove: () => void
  isUploading: boolean
  uploadedImageUrl: string | null
  maxSizeMB: number
  formImageValue?: string
}

const ImageUploadWrapper: React.FC<ImageUploadWrapperProps> = ({
  onFilesAdded,
  onFileRemove,
  isUploading,
  uploadedImageUrl,
  maxSizeMB,
  formImageValue,
}) => {
  const maxSize = maxSizeMB * 1024 * 1024

  const [
    { files, isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile, getInputProps },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
    onFilesAdded: onFilesAdded,
  })

  const previewUrl = uploadedImageUrl || files[0]?.preview || formImageValue || null

  const handleRemove = useCallback(() => {
    if (files[0]) {
      removeFile(files[0].id)
    }
    onFileRemove()
  }, [files, removeFile, onFileRemove])

  return (
    <div className="flex flex-col gap-2 cursor-pointer">
      <div className="relative">
        {/* Drop area */}
        <div
          role="button"
          onClick={!isUploading ? openFileDialog : undefined}
          onDragEnter={!isUploading ? handleDragEnter : undefined}
          onDragLeave={!isUploading ? handleDragLeave : undefined}
          onDragOver={!isUploading ? handleDragOver : undefined}
          onDrop={!isUploading ? handleDrop : undefined}
          data-dragging={isDragging || undefined}
          className={`border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[img]:border-none has-[input:focus]:ring-[3px] ${
            isUploading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <input {...getInputProps()} className="sr-only" aria-label="Upload thumbnail" disabled={isUploading} />

          {previewUrl ? (
            <div className="absolute inset-0">
              <Image fill src={previewUrl || "/placeholder.svg"} alt="Course thumbnail" className="size-full object-cover" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <ImageUpIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">Drop your thumbnail here or click to browse</p>
              <p className="text-muted-foreground text-xs">Max size: {maxSizeMB}MB</p>
            </div>
          )}
        </div>

        {/* Remove button */}
        {previewUrl && !isUploading && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={handleRemove}
              aria-label="Remove thumbnail"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
}

export default ImageUploadWrapper