"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface FileInfo {
  id: number
  name: string
  size: number
  path: string
  lastUpdated: string
}

export function ResourceGrid() {
  const [files, setFiles] = useState<FileInfo[]>([])

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => setFiles(data))
      .catch(error => console.error("Error fetching resources:", error))
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <a 
          href={file.path}
          download={file.name}
          key={file.path}
        >
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium truncate w-full text-center">{file.name}</p>
              <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)}kb</p>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  )
}

