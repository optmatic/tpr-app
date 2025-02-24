import { UploadResource } from "@/components/UploadResource"
import { ResourceGrid } from "@/components/ResourceGrid"

export default function Page() {
  return (
    <main>
      <div className="space-y-4 mb-4">
        <h1>Resources</h1>
        <p className="text-muted-foreground">Upload and manage your resources.</p>
      </div>
      <UploadResource />
      <br />
      <ResourceGrid />
    </main>
  )
}

