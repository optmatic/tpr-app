"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Cloud, File, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Image from 'next/image'

interface UploadResourceProps {
  onUploadSuccess?: (resource: {
    name: string;
    size: number;
    uploadDate: Date;
    title: string;
    yearLevel: string;
    subject: string;
    imageUrl: string;
  }) => void;
}

export function UploadResource({ onUploadSuccess }: UploadResourceProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [resourceDetails, setResourceDetails] = useState({
    title: '',
    yearLevel: '',
    subject: ''
  })
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    uploadDate: Date;
    title: string;
    yearLevel: string;
    subject: string;
    imageUrl: string;
  } | null>(null)

  const yearLevels = ["Foundation", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]
  const subjects = ["Mathematics", "English", "Science", "History", "Geography"]

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
      setShowDetailsDialog(true)
    }
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setShowDetailsDialog(false)

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", resourceDetails.title)
      formData.append("yearLevel", resourceDetails.yearLevel)
      formData.append("subject", resourceDetails.subject)
      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")
      
      const data = await response.json()
      
      // Only call the callback if it exists
      if (onUploadSuccess) {
        onUploadSuccess(data)
      }

      setUploadedFile({
        name: selectedFile.name,
        size: selectedFile.size,
        uploadDate: new Date(),
        ...resourceDetails,
        imageUrl: imagePreview || ''
      })

    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
      setSelectedImage(null)
      setImagePreview(null)
      setResourceDetails({ title: '', yearLevel: '', subject: '' })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
  })

  return (
    <>
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
                  <Progress value={0} className="w-1/2" />
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

          {uploadedFile && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Uploaded Resource</h3>
              <p className="text-sm">{uploadedFile.title}</p>
              <p className="text-xs text-muted-foreground">Year Level: {uploadedFile.yearLevel}</p>
              <p className="text-xs text-muted-foreground">Subject: {uploadedFile.subject}</p>
              <p className="text-xs text-muted-foreground">
                Size: {Math.round(uploadedFile.size / 1024)}kb
              </p>
              <p className="text-xs text-muted-foreground">
                Last updated: {uploadedFile.uploadDate.toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resource Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={resourceDetails.title}
                onChange={(e) => setResourceDetails(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter resource title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Year Level</label>
              <Select
                value={resourceDetails.yearLevel}
                onValueChange={(value) => setResourceDetails(prev => ({ ...prev, yearLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year level" />
                </SelectTrigger>
                <SelectContent>
                  {yearLevels.map((year) => (
                    <SelectItem key={year} value={year.toLowerCase()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Select
                value={resourceDetails.subject}
                onValueChange={(value) => setResourceDetails(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject.toLowerCase()}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Resource Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1"
              />
              {imagePreview && (
                <div className="mt-2 relative w-full h-40">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
              )}
            </div>
            <Button onClick={handleUpload} className="w-full">
              Upload Resource
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

