import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { readdir, stat, mkdir } from "fs/promises"
import { join } from "path"

interface FileInfo {
  name: string
  size: number
  path: string
}

export async function ResourceGrid() {
  const uploadDir = join(process.cwd(), "public/uploads")
  let files: FileInfo[] = []

  try {
    await mkdir(uploadDir, { recursive: true })
    const fileNames = await readdir(uploadDir)
    
    const filePromises = fileNames.map(async (name) => {
      const filePath = join(uploadDir, name)
      const stats = await stat(filePath)
      return {
        name,
        size: stats.size,
        path: `/uploads/${name}`,
      }
    })

    files = await Promise.all(filePromises)
  } catch (error) {
    console.error("Error reading uploads directory:", error)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card key={file.path} className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium truncate w-full text-center">{file.name}</p>
            <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)}kb</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

