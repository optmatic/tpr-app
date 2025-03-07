"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Archive } from "lucide-react";
import { Resource as ResourceType, UploadedFile } from "@/lib/types";
import { getUploadedResources } from "@/lib/resources";
import { UploadResource } from "@/components/UploadResource";

const yearLevels = [
  "Foundation",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];
const subjects = ["Mathematics", "English", "Science", "History", "Geography"];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function LearningResources() {
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set()
  );
  const [yearFilter, setYearFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [uploadedResourcesFormatted, setUploadedResourcesFormatted] = useState<
    ResourceType[]
  >([]);

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        console.log("Starting resource fetch...");
        const [apiResources, uploadedResources] = await Promise.all([
          fetch("/api/resources").then((res) => res.json()),
          getUploadedResources(),
        ]);

        console.log("API resources (raw):", apiResources);
        console.log("Uploaded resources (raw):", uploadedResources);

        // First, deduplicate resources by title and content
        const uniqueResourceMap = new Map<string, ResourceType>();

        // Process API resources first (they should take precedence)
        apiResources.forEach((resource: ResourceType) => {
          const key = `${resource.title}-${resource.fileName}`;
          uniqueResourceMap.set(key, resource);
        });

        // Then process new uploads, only adding those not already in the map
        uploadedResources
          .filter((file: UploadedFile) => {
            const key = `${file.title || file.name}-${file.name}`;
            return !uniqueResourceMap.has(key);
          })
          .forEach((file: UploadedFile) => {
            const key = `${file.title || file.name}-${file.name}`;
            const newResource: ResourceType = {
              id: Date.now() + Math.floor(Math.random() * 1000),
              title: file.title || file.name,
              fileName: file.name,
              downloadUrl: file.path,
              thumbnail: file.imageUrl || "/placeholder.svg",
              year: file.yearLevel || "Unknown",
              subject: file.subject || "Unknown",
              curriculumCode: "-",
              topic: `Size: ${Math.round(file.size / 1024)}kb`,
              lastUpdated: file.lastUpdated,
              description: "",
            };
            uniqueResourceMap.set(key, newResource);
          });

        // Get the deduplicated resources
        const deduplicatedResources: ResourceType[] = Array.from(
          uniqueResourceMap.values()
        );

        console.log(
          "Deduplicated resources count:",
          deduplicatedResources.length
        );

        // Now filter out invalid resources
        const validResources: ResourceType[] = deduplicatedResources.filter(
          (resource: ResourceType) => {
            // Check if this is a properly saved database resource
            const isValidResource =
              resource.fileName &&
              resource.downloadUrl &&
              (typeof resource.id === "number" || !isNaN(Number(resource.id)));

            if (!isValidResource) {
              console.log(`Filtering out invalid resource:`, resource);
            }

            return isValidResource;
          }
        );

        // Normalize the remaining valid resources
        const normalizedResources: ResourceType[] = validResources.map(
          (resource: ResourceType) => {
            // Normalize year level
            let normalizedYear = resource.year || "Unknown";
            if (normalizedYear.toLowerCase() === "unknown") {
              normalizedYear = "Unknown";
            } else if (normalizedYear.toLowerCase() === "foundation") {
              normalizedYear = "Foundation";
            }

            // Normalize subject
            let normalizedSubject = resource.subject || "Unknown";
            if (normalizedSubject.toLowerCase() === "mathematics") {
              normalizedSubject = "Mathematics";
            } else if (normalizedSubject.toLowerCase() === "geography") {
              normalizedSubject = "Geography";
            }

            return {
              ...resource,
              year: normalizedYear,
              subject: normalizedSubject,
              thumbnail: resource.thumbnail || "/placeholder.svg",
              curriculumCode: resource.curriculumCode || "-",
              // Ensure topic is properly formatted
              topic: resource.topic || `Size: NaNkb`,
            };
          }
        );

        console.log("Final normalized resources:", normalizedResources);
        setUploadedResourcesFormatted(normalizedResources);

        // After fetching resources
        console.log(
          "Resources with name 'LR1':",
          [...deduplicatedResources, ...apiResources].filter(
            (r) => r.title === "LR1" || r.fileName === "LR1"
          )
        );

        // Check for resources with foundation/unknown year level
        console.log(
          "Resources with foundation/unknown year:",
          [...deduplicatedResources, ...apiResources].filter(
            (r) =>
              r.year?.toLowerCase() === "foundation" ||
              r.year?.toLowerCase() === "unknown"
          )
        );

        // Check for resources with different image handling
        console.log(
          "Resources with different image paths:",
          [...deduplicatedResources, ...apiResources].map((r) => ({
            id: r.id,
            title: r.title,
            thumbnail: r.thumbnail,
          }))
        );
      } catch (error) {
        console.error("Error fetching/saving resources:", error);
      }
    };

    fetchResources();
  }, []);

  const toggleResource = (id: string) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedResources(newSelected);
  };

  const handleDownload = () => {
    selectedResources.forEach((id) => {
      const resource = uploadedResourcesFormatted.find(
        (r) => r.id === Number(id)
      );
      if (!resource) return;

      const link = document.createElement("a");
      link.href = resource.downloadUrl;
      link.download = resource.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const filteredResources = uploadedResourcesFormatted.filter((resource) => {
    console.log("Filtering resource:", {
      id: resource.id,
      year: resource.year,
      subject: resource.subject,
      yearFilter,
      subjectFilter,
    });

    // Case-insensitive comparison for year filter
    if (yearFilter && yearFilter !== "all") {
      const resourceYear = (resource.year || "").toLowerCase();
      const filterYear = yearFilter.toLowerCase();

      // Check if the resource year contains the filter value or vice versa
      if (
        !resourceYear.includes(filterYear) &&
        !filterYear.includes(resourceYear)
      ) {
        console.log(`Resource ${resource.id} filtered out by year`);
        return false;
      }
    }

    // Case-insensitive comparison for subject filter
    if (subjectFilter && subjectFilter !== "all") {
      const resourceSubject = (resource.subject || "").toLowerCase();
      const filterSubject = subjectFilter.toLowerCase();

      // Check if the resource subject contains the filter value or vice versa
      if (
        !resourceSubject.includes(filterSubject) &&
        !filterSubject.includes(resourceSubject)
      ) {
        console.log(`Resource ${resource.id} filtered out by subject`);
        return false;
      }
    }

    return true;
  });

  console.log("Filtered resources count:", filteredResources.length);

  const handleNewResource = async (uploadedResource: {
    id: string;
    name: string;
    size: number;
    lastUpdated: string;
    title: string;
    yearLevel: string;
    subject: string;
    imageUrl: string | null;
    path: string;
  }) => {
    console.log("Handling new resource:", uploadedResource);

    // Check if this resource already exists
    const isDuplicate = uploadedResourcesFormatted.some(
      (r) =>
        r.fileName === uploadedResource.name ||
        r.title === uploadedResource.title
    );

    if (isDuplicate) {
      console.log("Resource already exists, skipping upload");
      return;
    }

    const resource = {
      title: uploadedResource.title,
      fileName: uploadedResource.name,
      downloadUrl: uploadedResource.path,
      thumbnail: uploadedResource.imageUrl || "/placeholder.svg",
      year: uploadedResource.yearLevel || "Unknown",
      subject: uploadedResource.subject || "Unknown",
      curriculumCode: "-",
      topic: `Size: ${Math.round(uploadedResource.size / 1024)}kb`,
      description: "",
      lastUpdated: uploadedResource.lastUpdated,
    };

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resource),
      });

      if (!response.ok) throw new Error("Failed to save resource");

      const savedResource = await response.json();
      setUploadedResourcesFormatted((prev) => [savedResource, ...prev]);
    } catch (error) {
      console.error("Error saving resource:", error);
    }
  };

  const archiveResource = async (id: string) => {
    try {
      const resourceId = id.toString();
      console.log(`Attempting to archive resource with ID: ${resourceId}`);

      const response = await fetch(`/api/resources/${resourceId}/archive`, {
        method: "PATCH",
      });

      console.log(`Archive API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Archive API error response:", errorData);
        throw new Error(errorData.error || "Failed to archive resource");
      }

      // Remove the archived resource from the local state
      setUploadedResourcesFormatted((prevResources) =>
        prevResources.filter(
          (resource) => resource.id.toString() !== resourceId
        )
      );

      console.log(`Successfully archived resource with ID: ${resourceId}`);
    } catch (error) {
      console.error("Error archiving resource:", error);
      alert("Failed to archive resource. Please try again.");
    }
  };

  console.log(
    "Rendering resources:",
    filteredResources.map((r) => ({
      id: r.id,
      title: r.title,
      year: r.year,
      subject: r.subject,
    }))
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1>Learning Resources</h1>
          <Button
            onClick={handleDownload}
            disabled={selectedResources.size === 0}
            className="min-w-[120px]"
          >
            <Download className="mr-2 h-4 w-4" />
            Download{" "}
            {selectedResources.size > 0 && `(${selectedResources.size})`}
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Year Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearLevels.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <Card
            key={resource.id}
            className={`group transition-all duration-200 hover:shadow-md ${
              selectedResources.has(resource.id.toString())
                ? "ring-2 ring-primary"
                : ""
            }`}
          >
            <CardContent className="p-0">
              <div className="relative">
                <div className="absolute left-3 top-3 z-10">
                  <Checkbox
                    checked={selectedResources.has(resource.id.toString())}
                    onCheckedChange={() =>
                      toggleResource(resource.id.toString())
                    }
                    className="h-5 w-5 border-2 border-white bg-white/90 transition-opacity group-hover:opacity-100 data-[state=checked]:bg-primary lg:opacity-0"
                  />
                </div>
                <div className="absolute right-3 top-3 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          "Are you sure you want to archive this resource?"
                        )
                      ) {
                        archiveResource(resource.id.toString());
                      }
                    }}
                    title="Archive resource"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
                <img
                  src={resource.thumbnail || "/placeholder.svg"}
                  alt={resource.title}
                  className="aspect-video w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{resource.year}</Badge>
                  <Badge variant="outline">{resource.subject}</Badge>
                  <Badge variant="outline" className="font-mono">
                    {resource.curriculumCode}
                  </Badge>
                </div>
                <h3 className="line-clamp-2 font-medium">{resource.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {resource.topic}
                </p>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 text-sm text-muted-foreground">
              Last updated: {formatDate(resource.lastUpdated)}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* <UploadResource onUploadSuccess={handleNewResource} /> */}
    </div>
  );
}
