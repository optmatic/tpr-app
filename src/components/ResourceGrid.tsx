"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

export function ResourceGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium truncate w-full text-center">document-{i}.pdf</p>
            <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 1000)}kb</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

