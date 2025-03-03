"use client";

import { UploadResource } from "@/components/UploadResource";
import { ResourceGrid } from "@/components/ResourceGrid";
import { ResourceInfo } from "@/lib/types";
import { useState } from "react";

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceInfo[]>([]);

  const handleUploadSuccess = (newResource: ResourceInfo) => {
    setResources((prev) => [newResource, ...prev]);
  };

  return (
    <div className="space-y-8">
      <UploadResource onUploadSuccess={handleUploadSuccess} />
      <ResourceGrid resources={resources} setResources={setResources} />
    </div>
  );
}
