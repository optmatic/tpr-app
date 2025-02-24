"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface ResourceInfo {
  id: number
  name: string
  size: number
  path: string
  lastUpdated: string
  title: string
  yearLevel: string
  subject: string
  imageUrl: string
}

export function ResourceGrid() {
  const [resources, setResources] = useState<ResourceInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/resources')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch resources')
        return res.json()
      })
      .then(data => {
        console.log('Fetched resources:', data) // Debug log
        setResources(data)
      })
      .catch(error => {
        console.error("Error fetching resources:", error)
        setError(error.message)
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <div>Loading resources...</div>
  if (error) return <div>Error loading resources: {error}</div>
  if (!resources.length) return <div>No resources found</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {resources.map((resource) => (
        <a 
          href={resource.path}
          download={resource.name}
          key={resource.id}
        >
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              {resource.imageUrl ? (
                <img 
                  src={resource.imageUrl} 
                  alt={resource.title}
                  className="w-full h-32 object-cover mb-3 rounded"
                />
              ) : (
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium truncate">{resource.title}</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">{resource.yearLevel}</Badge>
                  <Badge variant="outline" className="text-xs">{resource.subject}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{Math.round(resource.size / 1024)}kb</p>
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  )
}

