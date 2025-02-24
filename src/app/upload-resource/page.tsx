"use client"

import { UploadResource } from "@/components/UploadResource"
import { ResourceGrid } from "@/components/ResourceGrid"
import { ResourceInfo } from "@/lib/types"
import { useState } from "react"

export default function Page() {
  const [resources, setResources] = useState<ResourceInfo[]>([])

  const handleUploadSuccess = (resource: { 
    name: string; 
    size: number; 
    uploadDate: string | Date;
    title: string; 
    yearLevel: string; 
    subject: string; 
    imageUrl: string; 
  }) => {
    const newResource: ResourceInfo = {
      id: Date.now(),
      name: resource.name,
      size: resource.size,
      path: resource.imageUrl,
      lastUpdated: typeof resource.uploadDate === 'string' 
        ? resource.uploadDate 
        : (resource.uploadDate?.toISOString() || new Date().toISOString()),
      title: resource.title,
      yearLevel: resource.yearLevel,
      subject: resource.subject,
      imageUrl: resource.imageUrl
    }
    setResources(prev => [...prev, newResource])
  }

  return (
    <main>
      <div className="space-y-4 mb-4">
        <h1>Resources</h1>
        <p className="text-muted-foreground">Upload and manage your resources.</p>
      </div>
      <UploadResource onUploadSuccess={handleUploadSuccess} />
      <br />
      <ResourceGrid resources={resources} setResources={setResources} />
    </main>
  )
}

