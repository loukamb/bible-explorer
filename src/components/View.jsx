import React, { useRef, useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import { useAppContext } from "./AppContext"
import TabBar from "./TabBar"
import ChapterTab from "./ChapterTab"
import VerseTab from "./VerseTab"

export default function View({
  viewId,
  width,
  onResize,
  containerWidth,
  containerLeft,
  dragIndex,
  dragOverIndex,
  onTabContextMenu,
  showTabBar,
  onTabDropBetweenViews,
}) {
  const { views, selectTabInView, removeTabFromView, reorderTabsInView } =
    useAppContext()
  const resizeRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const view = views.find((v) => v.id === viewId)
  if (!view) return null
  const { tabs, selectedTabIndex } = view
  const selectedTab = tabs[selectedTabIndex]

  const handleMouseDown = (e) => {
    if (!resizeRef.current) return
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !resizeRef.current || !containerWidth) return
    const mouseX = e.clientX
    const newPixelWidth = mouseX - (containerLeft || 0)
    let newWidthFraction = newPixelWidth / containerWidth

    const currentIndex = views.findIndex((v) => v.id === viewId)
    const nextView = views[currentIndex + 1]

    if (nextView && typeof onResize === "function") {
      const leftViewsWidth = views
        .slice(0, currentIndex)
        .reduce((sum, v) => sum + (v.width || 0), 0)

      const newLeftViewWidth = Math.max(0.1, newWidthFraction - leftViewsWidth)

      const otherViewsWidth = views.reduce(
        (sum, v, i) =>
          i !== currentIndex && i !== currentIndex + 1
            ? sum + (v.width || 0)
            : sum,
        0
      )

      const maxWidth = 1 - otherViewsWidth - 0.1
      const clampedWidth = Math.min(maxWidth, Math.max(0.1, newLeftViewWidth))

      onResize(viewId, nextView.id, clampedWidth)
    } else if (typeof onResize === "function") {
      const prevView = views[currentIndex - 1]
      if (prevView) {
        const totalOtherWidth = views.reduce(
          (sum, v, i) =>
            i !== currentIndex && i !== currentIndex - 1
              ? sum + (v.width || 0)
              : sum,
          0
        )
        const prevViewWidth = Math.max(
          0.1,
          1 - newWidthFraction - totalOtherWidth
        )
        onResize(prevView.id, viewId, prevViewWidth)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ width: `${(width || 1) * 100}%` }}
    >
      <div
        ref={resizeRef}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-300 z-10"
        onMouseDown={handleMouseDown}
      />
      <div className="absolute top-0 right-0 w-px h-full bg-gray-300 z-5" />
      {showTabBar && (
        <TabBar
          tabs={tabs}
          selectedTabIndex={selectedTabIndex}
          onTabSelect={(i) => selectTabInView(viewId, i)}
          onTabRemove={(i) => removeTabFromView(viewId, i)}
          onTabReorder={(from, to) => reorderTabsInView(viewId, from, to)}
          onTabDropBetweenViews={onTabDropBetweenViews}
          dragIndex={dragIndex}
          dragOverIndex={dragOverIndex}
          onTabContextMenu={onTabContextMenu}
          viewId={viewId}
        />
      )}
      <div className="reader flex-1 overflow-auto scrollbar-hide">
        {selectedTab &&
          (selectedTab.type === "chapter" ? (
            <ChapterTab tab={selectedTab} viewId={viewId} />
          ) : selectedTab.type === "verse" ? (
            <VerseTab tab={selectedTab} viewId={viewId} />
          ) : null)}
      </div>
    </div>
  )
}
