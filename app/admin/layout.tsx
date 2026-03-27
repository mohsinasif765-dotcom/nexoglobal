import AdminNav from "@/components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-light text-gray-900">
      
      {/* Main content area */}
      <main className="max-w-5xl mx-auto pb-32">
        {children}
      </main>

      {/* Navigation bar */}
      <AdminNav />
      
    </div>
  );
}