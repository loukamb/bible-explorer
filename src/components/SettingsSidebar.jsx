import { useAppContext } from "./AppContext"

export default function SettingsSidebar() {
  const {
    storageMode,
    migrateStorage,
    settingsSidebarOpen,
    setSettingsSidebarOpen,
  } = useAppContext()

  return (
    <>
      <div
        className={`absolute left-0 top-0 w-screen h-screen z-40 transition duration-300 ${
          !settingsSidebarOpen
            ? "pointer-events-none backdrop-blur-0 bg-transparent"
            : "pointer-events-auto backdrop-blur-sm "
        }`}
        onClick={() => setSettingsSidebarOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[22rem] max-w-full bg-white shadow-2xl z-[100] transition-transform duration-300 border-l border-zinc-200 flex flex-col ${
          settingsSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ minHeight: "100vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h2 className="text-lg font-bold">Settings</h2>
          <button
            className="p-1 rounded hover:bg-zinc-100"
            onClick={() => setSettingsSidebarOpen(false)}
            title="Close settings"
          >
            ×
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <label className="block font-semibold mb-2">Settings Storage</label>
          <div className="flex flex-col gap-2 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="storageMode"
                value="url"
                checked={storageMode === "url"}
                onChange={() => migrateStorage("url")}
              />
              URL-based (default)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="storageMode"
                value="local"
                checked={storageMode === "local"}
                onChange={() => migrateStorage("local")}
              />
              LocalStorage
            </label>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            URL mode is shareable and bookmarkable, while LocalStorage mode is
            private and persistent. Choose URL mode when working across devices.
          </p>
        </div>
      </div>
    </>
  )
}
