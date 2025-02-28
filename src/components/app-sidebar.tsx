"use client";

import * as React from "react";
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
  NotebookPen,
  UserRound,
  Upload,
  Archive,
} from "lucide-react";

import Logo from "/public/tutorpro-logo.svg";

import { NavMain } from "@/components/nav-main";
import { SimpleNav } from "@/components/simple-nav";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "admin",
    email: "admin@tpr.com",
    avatar:
      "https://www.optmatic.com/_next/static/media/optmatic-logo.5155a03d.svg",
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

  menus: [
    {
      label: "Admin",
      items: [
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
          name: "Pretest Archive",
          url: "/pretest-archive",
          icon: Archive,
        },
        {
          name: "Upload Resource",
          url: "/upload-resource",
          icon: Upload,
        },
        {
          name: "Learning Resources",
          url: "/learning-resources",
          icon: BookOpen,
        },
        {
          name: "Student Results",
          url: "/student-results",
          icon: NotebookPen,
        },
      ],
    },
    {
      label: "Tutor",
      items: [
        {
          name: "Your Students",
          url: "/your-students",
          icon: UserRound,
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
        {
          name: "Learning Resources",
          url: "/learning-resources",
          icon: BookOpen,
        },
        // ... more items
      ],
    },
    {
      label: "Student",
      items: [
        {
          name: "Pretests",
          url: "/pretest",
          icon: Notebook,
        },
        {
          name: "Your Results",
          url: "/your-results",
          icon: PieChart,
        },
        {
          name: "Learning Resources",
          url: "/learning-resources",
          icon: BookOpen,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <div className="p-4">
          <a href="/dashboard">
            <img
              src={Logo.src}
              alt="TutorPro Logo"
              className="w-[180px] h-[80px]"
            />
          </a>
        </div>
        {data.menus.map((menu) => (
          <SimpleNav key={menu.label} menuData={menu} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
