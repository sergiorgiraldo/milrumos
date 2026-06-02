export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-pale-slate-50">
      <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-ruby-red-600 mb-4">Milrumos</h1>
        <p className="text-pale-slate-700 text-lg mb-8">
          Collaborative writing. Branch from any point. Build on each other.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <span className="px-4 py-2 rounded-full bg-ruby-red-100 text-ruby-red-700 text-sm font-medium">
            Write
          </span>
          <span className="px-4 py-2 rounded-full bg-air-force-blue-100 text-air-force-blue-700 text-sm font-medium">
            Branch
          </span>
          <span className="px-4 py-2 rounded-full bg-sky-blue-100 text-sky-blue-700 text-sm font-medium">
            Collaborate
          </span>
        </div>
      </div>
    </main>
  );
}
