import React, { useRef, useEffect, useState } from "react"
import { useAppContext } from "./AppContext"
import View from "./View"
import TabContextMenu from "./TabContextMenu"

export default function MultiViewContainer({
  contextMenu,
  onTabContextMenu,
  closeContextMenu,
  splitTabIntoView,
  handleCloseTab,
  handleCloseOtherTabs,
  handleCloseAllTabs,
}) {
  const {
    views,
    resizeViewsBetween,
    addTabToView,
    removeTabFromView,
    selectTabInView,
  } = useAppContext()
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerLeft, setContainerLeft] = useState(0)
  useEffect(() => {
    if (!containerRef.current) return
    const updateRect = () => {
      setContainerWidth(containerRef.current.offsetWidth)
      setContainerLeft(containerRef.current.getBoundingClientRect().left)
    }
    updateRect()
    const resizeObserver = new ResizeObserver(updateRect)
    resizeObserver.observe(containerRef.current)
    window.addEventListener("resize", updateRect)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateRect)
    }
  }, [])
  const handleTabDropBetweenViews = (
    fromViewId,
    fromIndex,
    toViewId,
    toIndex
  ) => {
    if (fromViewId === toViewId) return
    const fromView = views.find((v) => v.id === fromViewId)
    if (!fromView) return
    const tab = fromView.tabs[fromIndex]
    if (!tab) return
    removeTabFromView(fromViewId, fromIndex)
    setTimeout(() => {
      addTabToView(toViewId, tab, false)
      selectTabInView(toViewId, toIndex)
    }, 0)
  }

  return (
    <div className="h-full w-full flex overflow-hidden">
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {views.map((view) => (
          <View
            key={view.id}
            viewId={view.id}
            width={view.width || undefined}
            onResize={resizeViewsBetween}
            containerWidth={containerWidth}
            containerLeft={containerLeft}
            showTabBar={views.length > 1}
            onTabContextMenu={onTabContextMenu}
            onTabDropBetweenViews={handleTabDropBetweenViews}
          />
        ))}
      </div>
      <TabContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onSplitIntoView={splitTabIntoView}
        onCloseTab={handleCloseTab}
        onCloseOtherTabs={handleCloseOtherTabs}
        onCloseAllTabs={handleCloseAllTabs}
        canSplit={views.length < 4}
      />
    </div>
  )
}
