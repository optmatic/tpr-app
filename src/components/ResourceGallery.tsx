"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
<<<<<<< HEAD
import PlaceholderImage from "../../public/placeholder.png"

interface Resource {
  id: string
  title: string
  thumbnail: string
  lastUpdated: string
  year: string
  subject: string
  curriculumCode: string
  topic: string
}
=======
import { Resource } from "@/lib/types"

>>>>>>> origin/dev

const yearLevels = ["Foundation", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]
const subjects = ["Mathematics", "English", "Science", "History", "Geography"]

<<<<<<< HEAD
const resources: Resource[] = [
  {
    id: "1",
    title: "Number and Place Value",
    thumbnail: PlaceholderImage.src,
    lastUpdated: "2024-02-15",
    year: "Foundation",
    subject: "Mathematics",
    curriculumCode: "ACMNA001",
    topic: "Numbers",
  },
  {
    id: "2",
    title: "Reading Comprehension Strategies",
    thumbnail: PlaceholderImage.src,
    lastUpdated: "2024-02-10",
    year: "Year 1",
    subject: "English",
    curriculumCode: "ACELY1660",
    topic: "Literacy",
  },
  {
    id: "3",
    title: "Living Things and Their Needs",
    thumbnail: PlaceholderImage.src,
    lastUpdated: "2024-02-01",
    year: "Year 2",
    subject: "Science",
    curriculumCode: "ACSSU030",
    topic: "Biology",
  },
  {
    id: "4",
    title: "Addition and Subtraction",
    thumbnail: PlaceholderImage.src,
    lastUpdated: "2024-02-20",
    year: "Year 3",
    subject: "Mathematics",
    curriculumCode: "ACMNA053",
    topic: "Operations",
  },
  {
    id: "5",
    title: "First Australians",
    thumbnail: PlaceholderImage.src,
    lastUpdated: "2024-02-18",
    year: "Year 4",
    subject: "History",
    curriculumCode: "ACHHK080",
    topic: "Indigenous History",
  },
  {
    id: "6",
    title: "Weather and Climate",
    thumbnail: PlaceholderImage.src,
    lastUpdated: "2024-02-05",
    year: "Year 5",
    subject: "Geography",
    curriculumCode: "ACHASSK114",
    topic: "Climate",
  },
]
=======
>>>>>>> origin/dev

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

<<<<<<< HEAD
export default function ResourceGallery() {
=======
export default function ResourceGallery({ resources }: { resources: Resource[] }) {
>>>>>>> origin/dev
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set())
  const [yearFilter, setYearFilter] = useState<string>("")
  const [subjectFilter, setSubjectFilter] = useState<string>("")

  const toggleResource = (id: string) => {
    const newSelected = new Set(selectedResources)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedResources(newSelected)
  }

  const handleDownload = () => {
<<<<<<< HEAD
    console.log("Downloading resources:", Array.from(selectedResources))
=======
    selectedResources.forEach((id) => {
      const resource = resources.find(r => r.id === Number(id));
      if (!resource) return;

      const link = document.createElement('a');
      link.href = resource.downloadUrl;
      link.download = resource.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
>>>>>>> origin/dev
  }

  const filteredResources = resources.filter((resource) => {
    if (yearFilter && yearFilter !== "all" && resource.year !== yearFilter) return false
    if (subjectFilter && subjectFilter !== "all" && resource.subject !== subjectFilter) return false
    return true
  })

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1>Learning Resources</h1>
          <Button onClick={handleDownload} disabled={selectedResources.size === 0} className="min-w-[120px]">
            <Download className="mr-2 h-4 w-4" />
            Download {selectedResources.size > 0 && `(${selectedResources.size})`}
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
<<<<<<< HEAD
              selectedResources.has(resource.id) ? "ring-2 ring-primary" : ""
=======
              selectedResources.has(resource.id.toString()) ? "ring-2 ring-primary" : ""
>>>>>>> origin/dev
            }`}
          >
            <CardContent className="p-0">
              <div className="relative">
                <div className="absolute left-3 top-3 z-10">
                  <Checkbox
<<<<<<< HEAD
                    checked={selectedResources.has(resource.id)}
                    onCheckedChange={() => toggleResource(resource.id)}
=======
                    checked={selectedResources.has(resource.id.toString())}
                    onCheckedChange={() => toggleResource(resource.id.toString())}
>>>>>>> origin/dev
                    className="h-5 w-5 border-2 border-white bg-white/90 transition-opacity group-hover:opacity-100 data-[state=checked]:bg-primary lg:opacity-0"
                  />
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
                <p className="mt-2 text-sm text-muted-foreground">{resource.topic}</p>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 text-sm text-muted-foreground">
              Last updated: {formatDate(resource.lastUpdated)}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}