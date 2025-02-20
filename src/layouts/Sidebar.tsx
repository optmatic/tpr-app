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
    const currentSegment = pathSegments[pathSegments.length - 1]
    const parentSegment = pathSegments[pathSegments.length - 2] || "Dashboard"

    if (parentSegment.toLowerCase() === currentSegment.toLowerCase()) {
      return [(
        <BreadcrumbItem key={currentSegment}>
          <BreadcrumbPage>
            {currentSegment
              .split("-")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </BreadcrumbPage>
        </BreadcrumbItem>
      )]
    }

    return [parentSegment, currentSegment].map((segment, index) => (
      <BreadcrumbItem key={segment}>
        {index === 1 ? (
          <BreadcrumbPage>{segment
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
          </BreadcrumbPage>
        ) : (
          <>
            <BreadcrumbLink href={`/${segment.toLowerCase()}`}>
              {segment
                .split("-")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </BreadcrumbLink>
            <span aria-hidden="true" className="mx-2">/</span>
          </>
        )}
      </BreadcrumbItem>
    ))
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center">
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
