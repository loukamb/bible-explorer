import { useAppContext } from "./AppContext"

export default function SettingsSidebar() {
  const {
    storageMode,
    setStorageMode,
    settingsSidebarOpen,
    setSettingsSidebarOpen,
  } = useAppContext()

  return (
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
        <label className="block font-semibold mb-2">Tab State Storage</label>
        <div className="flex flex-col gap-2 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="storageMode"
              value="url"
              checked={storageMode === "url"}
              onChange={() => setStorageMode("url")}
            />
            URL-based (default)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="storageMode"
              value="local"
              checked={storageMode === "local"}
              onChange={() => setStorageMode("local")}
            />
            LocalStorage
          </label>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Choose how your open tabs are saved: in the URL
          (shareable/bookmarkable) or in your browser's LocalStorage (private,
          persistent).
        </p>
      </div>
    </div>
  )
}
