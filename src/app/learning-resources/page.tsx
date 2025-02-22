"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { Resource } from "@/lib/types"


const yearLevels = ["Foundation", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]
const subjects = ["Mathematics", "English", "Science", "History", "Geography"]


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};


export default function LearningResources({ resources = [] }: { resources?: Resource[] }) {
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
              selectedResources.has(resource.id.toString()) ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardContent className="p-0">
              <div className="relative">
                <div className="absolute left-3 top-3 z-10">
                  <Checkbox
                    checked={selectedResources.has(resource.id.toString())}
                    onCheckedChange={() => toggleResource(resource.id.toString())}
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