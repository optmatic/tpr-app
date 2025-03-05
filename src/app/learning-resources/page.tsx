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
        const [apiResources, uploadedResources] = await Promise.all([
          fetch("/api/resources").then((res) => res.json()),
          getUploadedResources(),
        ]);

        console.log("API resources:", apiResources);
        console.log("Uploaded resources:", uploadedResources);

        // Process new uploads that aren't in the API resources
        const existingFileNames = new Set(
          apiResources.map((r: ResourceType) => r.fileName)
        );

        const newResources = uploadedResources
          .filter((file: UploadedFile) => !existingFileNames.has(file.name))
          .map((file: UploadedFile) => ({
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
          }));

        // Save new resources to API
        await Promise.all(
          newResources.map((resource: ResourceType) =>
            fetch("/api/resources", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resource),
            })
          )
        );

        // Update state with all resources
        setUploadedResourcesFormatted([...newResources, ...apiResources]);
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
    if (yearFilter && yearFilter !== "all" && resource.year !== yearFilter)
      return false;
    if (
      subjectFilter &&
      subjectFilter !== "all" &&
      resource.subject !== subjectFilter
    )
      return false;
    return true;
  });

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
      const response = await fetch(`/api/resources/${id}/archive`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to archive resource");
      }

      // Remove the archived resource from the local state
      setUploadedResourcesFormatted((prevResources) =>
        prevResources.filter((resource) => resource.id.toString() !== id)
      );
    } catch (error) {
      console.error("Error archiving resource:", error);
      alert("Failed to archive resource. Please try again.");
    }
  };

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
