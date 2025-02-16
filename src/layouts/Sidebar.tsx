"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)
  
  const getBreadcrumbs = () => {
    let accumulatedPath = ""
    // Show all segments if 1 or fewer, otherwise last 2
    const segmentsToShow = pathSegments.length <= 1 ? pathSegments : pathSegments.slice(-2)
    
    return segmentsToShow.map((segment, index) => {
      accumulatedPath += `/${segment}`
      const formattedSegment = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      return (
        <BreadcrumbItem key={segment} className={index === 0 ? "hidden md:block" : ""}>
          {index === segmentsToShow.length - 1 ? (
            <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
          ) : (
            <>
              <BreadcrumbLink href={accumulatedPath}>{formattedSegment}</BreadcrumbLink>
              <BreadcrumbSeparator />
            </>
          )}
        </BreadcrumbItem>
      )
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.length === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbPage>Home</BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  getBreadcrumbs()
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
