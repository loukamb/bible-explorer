import { useState } from "react"
import { Icon } from "@iconify/react"
import Tab from "./Tab"

export default function TabBar({
  tabs = [],
  selectedTabIndex = 0,
  onTabSelect,
  onTabRemove,
  onTabReorder,
  onTabDropBetweenViews,
  dragIndex,
  dragOverIndex,
  onTabContextMenu,
  viewId,
}) {
  const [draggedTab, setDraggedTab] = useState(null)
  const [draggedViewId, setDraggedViewId] = useState(null)
  const [dragOverTab, setDragOverTab] = useState(null)

  const handleDragStart = (e, i) => {
    setDraggedTab(i)
    setDraggedViewId(viewId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", `${viewId}:${i}`)
  }

  const handleDragOver = (e, i) => {
    e.preventDefault()
    setDragOverTab(i)
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, i) => {
    e.preventDefault()
    const data = e.dataTransfer.getData("text/plain")
    const [fromViewId, fromIndex] = data.split(":").map(Number)
    if (fromViewId === viewId) {
      if (onTabReorder && fromIndex !== i) {
        onTabReorder(fromIndex, i)
      }
    } else if (onTabDropBetweenViews) {
      onTabDropBetweenViews(fromViewId, fromIndex, viewId, i)
    }
    setDraggedTab(null)
    setDraggedViewId(null)
    setDragOverTab(null)
  }

  const handleDragEnd = () => {
    setDraggedTab(null)
    setDraggedViewId(null)
    setDragOverTab(null)
  }

  return (
    <nav className="flex items-center bg-zinc-100 shadow-lg h-10">
      <div
        className="whitespace-nowrap overflow-auto scrollbar-none"
        onDragEnd={handleDragEnd}
      >
        {tabs.map((tab, i) => (
          <Tab
            key={`${tab.type}:${tab.scripture.id}:${tab.book.name}:${
              tab.chapter.num
            }${tab.type === "verse" ? `:${tab.verse.num}` : ""}`}
            onClick={() => onTabSelect?.(i)}
            onDelete={() => onTabRemove?.(i)}
            selected={selectedTabIndex === i}
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onContextMenu={(e) => onTabContextMenu?.(e, viewId, i)}
            index={i}
            isDragging={draggedTab === i && draggedViewId === viewId}
            isDragOver={dragOverTab === i}
          >
            <span className="text-xs bg-zinc-100 px-0.5 rounded-md text-zinc-950 shadow-md border-2 border-zinc-400">
              {tab.scripture.id.toUpperCase()}
            </span>{" "}
            {tab.book.name} {tab.chapter.num}
            {tab.type === "verse" && `:${tab.verse.num}`}
          </Tab>
        ))}
      </div>
    </nav>
  )
}
