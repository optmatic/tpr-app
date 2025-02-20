"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  HomeIcon,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "admin",
    email: "admin@tpr.com",
    avatar: "https://www.optmatic.com/_next/static/media/optmatic-logo.5155a03d.svg",
  },
  teams: [
    {
      name: "admin",
      logo: GalleryVerticalEnd,
      plan: "admin",
    },
    {
      name: "tutor",
      logo: Command,
      plan: "tutor",
    },
    {
      name: "student",
      logo: AudioWaveform,
      plan: "student",
    },
    
  ],

  // {
  //   title: "Documentation",
  //   url: "#",
  //   icon: BookOpen,
  
  //   },

  navMain: [
    {
      title: "Assessment",
      url: "/assessment",
      icon: Bot,
      items: [
        {
          title: "Quiz Creator",
          url: "/quiz-creator",
        },
        {
          title: "Quiz List",
          url: "/quiz-list",
        },
        {
          title: "Student Results",
          url: "/student-results",
        },
      ],
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader> */}
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
