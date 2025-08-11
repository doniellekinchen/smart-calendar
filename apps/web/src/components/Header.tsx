export default function Header() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">

          {/* Left: Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <a
              href="/"
              aria-label="Qlear — Home"
              className="text-xl font-semibold tracking-tight text-slate-900 hover:opacity-90 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Qlear
            </a>
            <span className="hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              beta
            </span>
          </div>

          {/* Center: Main nav (desktop only) */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-6">
            <a
              href="/"
              aria-current="page"
              className="text-sm font-medium text-slate-900 underline underline-offset-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Calendar
            </a>
            <a
              href="/habits"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Habits
            </a>
            <a
              href="/settings"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Settings
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Login
            </a>
            <a
              href="/signup"
              className="hidden md:inline-flex border rounded-lg px-3 py-2 text-sm text-slate-700 border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Get Qlear
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
