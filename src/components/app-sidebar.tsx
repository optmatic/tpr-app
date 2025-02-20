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
  Blocks,
  ListCheck,
  Notebook,
  NotebookPen
} from "lucide-react"

import Logo from "/public/tutorpro-logo.svg"


import { NavMain } from "@/components/nav-main"
import { SimpleNav } from "@/components/simple-nav"
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

  // navMain: [
  //   {
  //     title: "Assessment",
  //     url: "/assessment",
  //     icon: Bot,
  //     items: [
  //       {
  //         title: "Quiz Creator",
  //         url: "/quiz-creator",
  //         icon: Blocks,
  //       },
  //       {
  //         title: "Quiz List",
  //         url: "/quiz-list",
          
  //       },
  //       {
  //         title: "Student Results",
  //         url: "/student-results",
  //       },
  //     ],
  //   },
  // ],
  simpleNav: [
    {
      name: "Quiz Creator",
      url: "/quiz-creator",
      icon: Blocks,
    },
    {
      name: "Quiz List",
      url: "/quiz-list",
      icon: ListCheck,
    },
    {
      name: "Student Results",
      url: "/student-results",
      icon: NotebookPen,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader> */}
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <div className="p-4">
          <a href="/dashboard">
            <img src={Logo.src} alt="TutorPro Logo" className="w-[180px] h-[80px]" />
          </a>
        </div>
        <SimpleNav simpleNav={data.simpleNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
