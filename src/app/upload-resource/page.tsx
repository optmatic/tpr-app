import { UploadResource } from "../../components/UploadResource"
import { ResourceGrid } from "@/components/ResourceGrid"

export default function Page() {
  return (
    <main className="container mx-auto p-4 max-w-4xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">Upload and manage your resources.</p>
      </div>
      <UploadResource />
      <ResourceGrid />
    </main>
  )
}

