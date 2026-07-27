export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-input-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-secondary text-sm font-medium">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}
