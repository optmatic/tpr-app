"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Archive } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { ResourceInfo } from "@/lib/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
      console.log("Fetching resources...");
      const res = await fetch("/api/resources");
      console.log("Response status:", res.status, res.statusText);

      if (!res.ok) {
        console.log("Response not OK, throwing error");
        throw new Error(
          `Failed to fetch resources: ${res.status} ${res.statusText}`
        );
      }

      console.log("Parsing response as JSON...");
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

  // Function to archive a resource
  const archiveResource = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/archive`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to archive resource");
      }

      // Remove the archived resource from the local state
      setResources((prevResources) =>
        prevResources.filter((resource) => resource.id !== resourceId)
      );
    } catch (error) {
      console.error("Error archiving resource:", error);
      alert("Failed to archive resource. Please try again.");
    }
  };

  if (isLoading) return <div>Loading resources...</div>;
  if (error) return <div>Error loading resources: {error}</div>;
  if (!resources.length) return <div>No resources found</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {resources.map((resource) => (
        <Card
          key={resource.id}
          className="hover:bg-muted/50 transition-colors cursor-pointer relative"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to archive this resource?")) {
                archiveResource(resource.id);
              }
            }}
            title="Archive resource"
          >
            <Archive className="h-4 w-4" />
          </Button>

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
                  Year Level:{" "}
                  <span className="capitalize ml-1 font-light">
                    {resource.yearLevel}
                  </span>
                </Badge>
                <Badge variant="outline">
                  Subject:{" "}
                  <span className="capitalize ml-1 font-light">
                    {resource.subject}
                  </span>
                </Badge>
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
