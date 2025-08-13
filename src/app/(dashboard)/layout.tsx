"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { SidebarNav } from "@/components/shared/sidebar-nav"
import { isAuthenticated } from "@/lib/auth"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const pathname = usePathname()
  const { loadProfile } = useAuthStore()
  
  useEffect(() => {
    if (!isAuthenticated() && pathname !== "/auth/login") {
      router.push("/auth/login")
      return
    }
    
    loadProfile()
  }, [router, pathname, loadProfile])

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 overflow-auto md:ml-64">
        <main className="container mx-auto py-6 px-4 md:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
