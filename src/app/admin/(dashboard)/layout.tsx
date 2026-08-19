import {
  BarChart3,
  Box,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Sparkles,
  Tags,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { createServerSupabase } from "@/lib/supabase/server";
import { site } from "@/lib/site";

export const metadata = {
  title: { default: "Admin", template: `%s · Admin · ${site.name}` },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single() as { data: { role: string; full_name: string } | null };

  if (!profile || profile.role !== "admin") redirect("/admin/login");

  return (
    <div className="flex min-h-dvh bg-ink-50">
      <AdminSidebar userName={profile.full_name || user.email || "Admin"} />
      <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:ml-64 lg:px-8">
        {children}
      </main>
    </div>
  );
}
