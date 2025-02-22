"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Cloud, File, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

export function UploadResource() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsUploading(true)

        for (const file of acceptedFiles) {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          // Simulate upload progress
          for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(i)
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        }

        // Refresh the page to show new uploads
        router.refresh()
      } catch (error) {
        console.error("Upload error:", error)
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [router],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
  })

  return (
    <Card>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 
            hover:border-primary/50 transition-colors
            ${isDragActive ? "border-primary" : "border-muted-foreground/25"}
            ${isUploading ? "pointer-events-none" : "cursor-pointer"}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-4">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <Progress value={uploadProgress} className="w-1/2" />
              </>
            ) : (
              <>
                {isDragActive ? (
                  <File className="h-8 w-8 text-primary" />
                ) : (
                  <Cloud className="h-8 w-8 text-muted-foreground" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium">{isDragActive ? "Drop files here" : "Drag & drop files here"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Or click to select files</p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

