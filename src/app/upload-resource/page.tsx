"use client";

import { UploadResource } from "@/components/UploadResource";
import { ResourceGrid } from "@/components/ResourceGrid";
import { ResourceInfo } from "@/lib/types";
import { useState } from "react";

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceInfo[]>([]);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  const handleUploadSuccess = (newResource: ResourceInfo) => {
    setResources((prev) => [newResource, ...prev]);
  };

  return (
    <div className="space-y-8">
      <UploadResource onUploadSuccess={handleUploadSuccess} />

      <div className="flex items-center gap-2 mb-4">
        <label htmlFor="showGrid" className="text-sm font-medium">
          Show Uploaded Resources
        </label>
        <div className="relative inline-block w-10 h-5">
          <input
            id="showGrid"
            type="checkbox"
            className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
            checked={showGrid}
            onChange={() => setShowGrid(!showGrid)}
          />
          <span
            className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
              showGrid ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-transform duration-200 ${
                showGrid ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </div>
      </div>

      {showGrid && (
        <ResourceGrid resources={resources} setResources={setResources} />
      )}
    </div>
  );
}
