import { useRef, useEffect, useState } from "react"
import { AppProvider, useAppContext } from "./AppContext"
import Sidebar from "./Sidebar"
import MultiViewContainer from "./MultiViewContainer"
import SettingsSidebar from "./SettingsSidebar"
import GlobalHeader from "./GlobalHeader"
import { Icon } from "@iconify/react"

function useHorizontalScroll() {
  const elRef = useRef()
  useEffect(() => {
    const el = elRef.current
    if (el) {
      const onWheel = (e) => {
        if (e.deltaY == 0) return
        e.preventDefault()
        el.scrollBy(e.deltaY, 0)
      }
      el.addEventListener("wheel", onWheel)
      return () => el.removeEventListener("wheel", onWheel)
    }
  }, [])
  return elRef
}

function AppContent() {
  const {
    views,
    setViews,
    selectTabInView,
    removeTabFromView,
    reorderTabsInView,
    splitTabToNewView,
    resizeView,
  } = useAppContext()

  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    tabIndex: null,
    viewId: null,
  })

  const handleTabContextMenu = (e, viewId, tabIndex) => {
    e.preventDefault()
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      viewId,
      tabIndex,
    })
  }

  const closeContextMenu = () =>
    setContextMenu((prev) => ({ ...prev, isOpen: false }))
  const handleSplitTab = () => {
    if (contextMenu.viewId != null && contextMenu.tabIndex != null) {
      splitTabToNewView(contextMenu.viewId, contextMenu.tabIndex)
      closeContextMenu()
    }
  }
  const handleCloseTab = () => {
    if (contextMenu.viewId != null && contextMenu.tabIndex != null) {
      removeTabFromView(contextMenu.viewId, contextMenu.tabIndex)
      closeContextMenu()
    }
  }
  const handleCloseOtherTabs = () => {
    if (contextMenu.viewId != null && contextMenu.tabIndex != null) {
      setViews((prev) =>
        prev.map((view) =>
          view.id === contextMenu.viewId
            ? {
                ...view,
                tabs: [view.tabs[contextMenu.tabIndex]],
                selectedTabIndex: 0,
              }
            : view
        )
      )
      closeContextMenu()
    }
  }
  const handleCloseAllTabs = () => {
    if (contextMenu.viewId != null) {
      setViews((prev) =>
        prev.map((view) =>
          view.id === contextMenu.viewId
            ? { ...view, tabs: [], selectedTabIndex: 0 }
            : view
        )
      )
      closeContextMenu()
    }
  }

  return (
    <div className="h-screen w-screen max-w-[100vw] max-h-screen flex">
      <Sidebar />
      <SettingsSidebar />
      <main className="flex flex-col h-full w-0 grow">
        <GlobalHeader
          showTabs={views.length === 1}
          onTabContextMenu={handleTabContextMenu}
        />
        <MultiViewContainer
          contextMenu={contextMenu}
          onTabContextMenu={handleTabContextMenu}
          closeContextMenu={closeContextMenu}
          splitTabIntoView={handleSplitTab}
          handleCloseTab={handleCloseTab}
          handleCloseOtherTabs={handleCloseOtherTabs}
          handleCloseAllTabs={handleCloseAllTabs}
        />
        <div className="flex flex-col md:flex-row text-xs items-center mt-auto bg-zinc-100 px-4 py-2 md:text-sm gap-1">
          Louka's Bible Explorer
          <span>
            (
            <a
              className="underline"
              target="_blank"
              href="https://github.com/loukamb/bible-explorer"
            >
              source code
            </a>
            ,{" "}
            <a
              className="underline"
              target="_blank"
              href="https://github.com/loukamb/bible-explorer/issues"
            >
              bug report
            </a>
            )
          </span>
          <span className="md:ml-auto">
            This work has been released into the public domain.
          </span>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
