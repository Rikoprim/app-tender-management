import { TenderDashboard } from "@/components/tender/TenderDashboard";

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Clean Header: Judul & Deskripsi singkat */}
        <header className="mb-6 pb-4 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Tender
            </h1>
            <p className="text-xs text-neutral-500">
              Pemantauan dokumen pengadaan & log audit kepatuhan
            </p>
          </div>
        </header>

        {/* Dashboard Client Component */}
        <TenderDashboard />
      </div>
    </main>
  );
}
