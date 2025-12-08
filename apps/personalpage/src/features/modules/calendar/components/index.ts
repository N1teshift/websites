import dynamic from "next/dynamic";

export { LessonSchedulerLayout } from "./LessonSchedulerLayout";
export { default as LessonSchedulerPage } from "./LessonSchedulerPage";
export { default as EventCreationForm } from "./EventCreationForm";
export { default as EventDetailsComponent } from "./EventDetails";
export { default as SidebarContent } from "./SidebarContent";

// Dynamically import Calendar to disable SSR and prevent hydration issues
export const Calendar = dynamic(() => import("./Calendar"), { ssr: false });
