// src/app/resource-archive/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { ResourceGrid } from "@/components/ResourceGrid";
import { ResourceInfo } from "@/lib/types";

export default function ResourceArchivePage() {
  const [resources, setResources] = useState<ResourceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArchivedResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/resources/[id]/archived");

      if (!res.ok) {
        throw new Error(
          `Failed to fetch archived resources: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      setResources(data);
    } catch (error) {
      console.error("Error fetching archived resources:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedResources();
  }, [fetchArchivedResources]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Resource Archive</h1>

      {isLoading ? (
        <div>Loading archived resources...</div>
      ) : error ? (
        <div>Error loading archived resources: {error}</div>
      ) : resources.length === 0 ? (
        <div>No archived resources found</div>
      ) : (
        <ResourceGrid
          resources={resources}
          setResources={setResources}
          isArchivePage={true}
        />
      )}
    </div>
  );
}
