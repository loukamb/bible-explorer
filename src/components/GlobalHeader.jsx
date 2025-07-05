import React from "react"
import { Icon } from "@iconify/react"
import { useAppContext } from "./AppContext"
import TabBar from "./TabBar"

export default function GlobalHeader({
  showTabs = false,
  onTabContextMenu,
  dragIndex,
  dragOverIndex,
}) {
  const {
    views,
    selectTabInView,
    removeTabFromView,
    reorderTabsInView,
    zoomLevel,
    setZoomLevel,
    verseWidth,
    setVerseWidth,
    setSettingsSidebarOpen,
    setBarHidden,
  } = useAppContext()

  const singleView = views[0]

  return (
    <nav className="flex items-center bg-zinc-100 shadow-lg h-10">
      <button
        className="w-fit inline-block px-4 py-3 hover:bg-zinc-300 cursor-default transition"
        onClick={() => setBarHidden((c) => !c)}
      >
        <Icon icon="fluent:book-16-regular" />
      </button>
      {showTabs && singleView && (
        <TabBar
          tabs={singleView.tabs}
          selectedTabIndex={singleView.selectedTabIndex}
          onTabSelect={(i) => selectTabInView(singleView.id, i)}
          onTabRemove={(i) => removeTabFromView(singleView.id, i)}
          onTabReorder={(from, to) =>
            reorderTabsInView(singleView.id, from, to)
          }
          dragIndex={dragIndex}
          dragOverIndex={dragOverIndex}
          onTabContextMenu={onTabContextMenu}
          viewId={singleView.id}
        />
      )}
      <div className="md:flex gap-4 hidden ml-auto p-4 items-center">
        <div className="flex items-center">
          <Icon icon="fluent:search-12-regular" className="mr-2" />
          <input
            type="range"
            min={1}
            max={100}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(e.target.valueAsNumber)}
          />
        </div>
        <div className="flex items-center">
          <Icon icon="fluent:auto-fit-width-24-filled" className="mr-2" />
          <input
            type="range"
            min={1}
            max={100}
            value={verseWidth}
            onChange={(e) => setVerseWidth(e.target.valueAsNumber)}
            className="w-16"
          />
        </div>
        <button
          className="ml-4 p-2 rounded hover:bg-zinc-200"
          title="Settings"
          onClick={() => setSettingsSidebarOpen(true)}
        >
          <Icon icon="fluent:settings-20-regular" />
        </button>
      </div>
    </nav>
  )
}
