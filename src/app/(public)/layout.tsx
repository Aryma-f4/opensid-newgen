import PublicSiteShell from "@/components/public/PublicSiteShell"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicSiteShell>{children}</PublicSiteShell>
}
