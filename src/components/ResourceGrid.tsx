"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { ResourceInfo } from "@/lib/types";
import Image from "next/image";

interface ResourceGridProps {
  resources: ResourceInfo[];
  setResources: React.Dispatch<React.SetStateAction<ResourceInfo[]>>;
}

export function ResourceGrid({ resources, setResources }: ResourceGridProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/resources");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch resources");
      }
      const data = await res.json();
      console.log("Fetched resources:", data);
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, [setResources]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  if (isLoading) return <div>Loading resources...</div>;
  if (error) return <div>Error loading resources: {error}</div>;
  if (!resources.length) return <div>No resources found</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {resources.map((resource) => (
        <Card
          key={resource.id}
          className="hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <CardContent className="p-4">
            {resource.imageUrl ? (
              <div className="relative h-32 w-full mb-4">
                <Image
                  src={resource.imageUrl}
                  alt={resource.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <FileText className="h-32 w-full text-muted-foreground" />
            )}
            <div className="space-y-2">
              <h3 className="font-medium truncate">{resource.name}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  Year Level: {resource.yearLevel}
                </Badge>
                <Badge variant="outline">Subject: {resource.subject}</Badge>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Size: {Math.round(resource.size / 1024)} KB</span>
                <span>
                  Last updated:{" "}
                  {new Date(resource.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
