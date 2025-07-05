import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react"

import { useScriptures, availableScriptureNames } from "./Scripture"

const AppContext = createContext()

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

export function AppProvider({ children }) {
  const scriptures = useScriptures()
  useEffect(() => {
    scriptures.load("nkjv")
  }, [scriptures])

  const [bookSearch, setBookSearch] = useState("")
  const [barHidden, setBarHidden] = useState(true)
  const [scrollLevel, setScrollLevel] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [verseWidth, setVerseWidth] = useState(1)
  const [readyToUpdateState, setReadyToUpdateState] = useState(false)
  const scriptureReader = useRef(null)

  // Views
  // =========================================================

  const [views, setViews] = useState([
    {
      id: 1,
      size: 1,
      tabs: [],
      selectedTabIndex: 0,
    },
  ])

  const getCurrentViewId = useCallback(() => {
    if (views.length === 1) {
      return views[0].id
    }
    const activeView = views.find((v) => v.selectedTabIndex !== undefined)
    return activeView ? activeView.id : views[0]?.id
  }, [views])

  const resizeViewsBetween = useCallback(
    (leftViewId, rightViewId, leftViewNewWidth) => {
      setViews((prev) => {
        const minWidth = 0.1
        const leftIdx = prev.findIndex((v) => v.id === leftViewId)
        const rightIdx = prev.findIndex((v) => v.id === rightViewId)

        if (leftIdx === -1 || rightIdx === -1 || leftIdx >= rightIdx)
          return prev

        let viewsCopy = prev.map((v) => ({ ...v }))

        viewsCopy[leftIdx].width = Math.max(minWidth, leftViewNewWidth)
        const totalOtherWidth = viewsCopy.reduce(
          (sum, v, i) =>
            i !== leftIdx && i !== rightIdx ? sum + (v.width || 0) : sum,
          0
        )
        const rightViewWidth = Math.max(
          minWidth,
          1 - leftViewNewWidth - totalOtherWidth
        )
        viewsCopy[rightIdx].width = rightViewWidth

        return viewsCopy
      })
    },
    []
  )

  const resizeView = useCallback(
    (viewId, newWidth) => {
      const idx = views.findIndex((v) => v.id === viewId)
      if (idx === -1) return

      const nextView = views[idx + 1]
      if (nextView) {
        resizeViewsBetween(viewId, nextView.id, newWidth)
      } else {
        const prevView = views[idx - 1]
        if (prevView) {
          const totalOtherWidth = views.reduce(
            (sum, v, i) =>
              i !== idx && i !== idx - 1 ? sum + (v.width || 0) : sum,
            0
          )
          const prevViewWidth = Math.max(0.1, 1 - newWidth - totalOtherWidth)
          resizeViewsBetween(prevView.id, viewId, prevViewWidth)
        }
      }
    },
    [resizeViewsBetween, views]
  )

  const removeView = useCallback((viewId) => {
    setViews((prev) => prev.filter((v) => v.id !== viewId))
  }, [])

  const addTabToView = useCallback((viewId, tab, focus = true) => {
    setViews((prev) => {
      const newViews = prev.map((view) => {
        if (view.id !== viewId) return view
        const exists = view.tabs.some(
          (t) =>
            t.type === tab.type &&
            t.scripture.id === tab.scripture.id &&
            t.book.name === tab.book.name &&
            t.chapter.num === tab.chapter.num &&
            (tab.type !== "verse" || t.verse?.num === tab.verse?.num)
        )
        if (exists) return view
        return {
          ...view,
          tabs: [...view.tabs, tab],
          selectedTabIndex: focus ? view.tabs.length : view.selectedTabIndex,
        }
      })
      return newViews
    })
  }, [])

  const removeTabFromView = useCallback((viewId, tabIndex) => {
    setViews((prev) => {
      let newViews = prev.map((view) => {
        if (view.id !== viewId) return view
        const newTabs = view.tabs.filter((_, i) => i !== tabIndex)
        let newSelected = view.selectedTabIndex
        if (tabIndex === view.selectedTabIndex) {
          newSelected = Math.max(0, tabIndex - 1)
        } else if (tabIndex < view.selectedTabIndex) {
          newSelected = view.selectedTabIndex - 1
        }
        return {
          ...view,
          tabs: newTabs,
          selectedTabIndex: newSelected,
        }
      })
      if (newViews.length > 1) {
        const toRemoveIdx = newViews.findIndex((view) => view.tabs.length === 0)
        if (toRemoveIdx !== -1) {
          const removedWidth = newViews[toRemoveIdx].width || 0
          newViews = newViews.filter((view, idx) => idx !== toRemoveIdx)
          if (newViews.length > 0) {
            if (toRemoveIdx > 0) {
              newViews[toRemoveIdx - 1].width =
                (newViews[toRemoveIdx - 1].width || 0) + removedWidth
            } else if (newViews.length > 0) {
              newViews[0].width = (newViews[0].width || 0) + removedWidth
            }
          }
        }
      }
      return newViews
    })
  }, [])

  const selectTabInView = useCallback((viewId, tabIndex) => {
    setViews((prev) =>
      prev.map((view) =>
        view.id === viewId ? { ...view, selectedTabIndex: tabIndex } : view
      )
    )
  }, [])

  const reorderTabsInView = useCallback((viewId, fromIndex, toIndex) => {
    setViews((prev) =>
      prev.map((view) => {
        if (view.id !== viewId) return view
        const newTabs = [...view.tabs]
        const [movedTab] = newTabs.splice(fromIndex, 1)
        newTabs.splice(toIndex, 0, movedTab)
        let newSelected = view.selectedTabIndex
        if (view.selectedTabIndex === fromIndex) {
          newSelected = toIndex
        } else if (
          view.selectedTabIndex > fromIndex &&
          view.selectedTabIndex <= toIndex
        ) {
          newSelected = view.selectedTabIndex - 1
        } else if (
          view.selectedTabIndex < fromIndex &&
          view.selectedTabIndex >= toIndex
        ) {
          newSelected = view.selectedTabIndex + 1
        }
        return {
          ...view,
          tabs: newTabs,
          selectedTabIndex: newSelected,
        }
      })
    )
  }, [])

  const splitTabToNewView = useCallback((viewId, tabIndex) => {
    setViews((prev) => {
      const sourceView = prev.find((v) => v.id === viewId)
      if (!sourceView) return prev
      const tabToMove = sourceView.tabs[tabIndex]
      if (!tabToMove) return prev
      const updatedViews = prev.map((view) => {
        if (view.id !== viewId) return view
        const newTabs = view.tabs.filter((_, i) => i !== tabIndex)
        let newSelected = view.selectedTabIndex
        if (tabIndex === view.selectedTabIndex) {
          newSelected = Math.max(0, tabIndex - 1)
        } else if (tabIndex < view.selectedTabIndex) {
          newSelected = view.selectedTabIndex - 1
        }
        return {
          ...view,
          tabs: newTabs,
          selectedTabIndex: newSelected,
        }
      })
      const rightmostView = updatedViews[updatedViews.length - 1]
      let newRightWidth = rightmostView.width || 1
      if (updatedViews.length === 1) {
        updatedViews[0].width = 1
      }
      if (updatedViews.length >= 1) {
        newRightWidth = (rightmostView.width || 1) / 2
        updatedViews[updatedViews.length - 1] = {
          ...rightmostView,
          width: newRightWidth,
        }
      }
      const newViewId = Math.max(...prev.map((v) => v.id)) + 1
      const newView = {
        id: newViewId,
        size: 1,
        tabs: [tabToMove],
        selectedTabIndex: 0,
        width: newRightWidth,
      }
      return [...updatedViews, newView]
    })
  }, [])

  const [selectedScripture, setSelectedScripture_internal] = useState("nkjv")
  const setSelectedScripture = useCallback(
    (id) => {
      setSelectedScripture_internal(id)
      scriptures.load(id)
    },
    [scriptures]
  )

  const groups = useMemo(() => {
    const groups = {}
    for (const [id, { name, category }] of Object.entries(
      availableScriptureNames
    )) {
      ;(groups[category ?? "Other"] ||= []).push({ id, name })
    }
    return groups
  }, [])

  // Tabs
  // =========================================================

  const addVerseTab = useCallback(
    (scripture, book, chapter, verse, focus = true, viewId = null) => {
      if (views.length > 0) {
        const targetViewId = viewId || getCurrentViewId()
        const tab = {
          type: "verse",
          book,
          chapter,
          verse,
          scripture,
          bookIndex: scripture.books.findIndex((bk) => bk.name === book.name),
          scroll: 0,
        }
        addTabToView(targetViewId, tab, focus)
      }
    },
    [views, addTabToView, getCurrentViewId]
  )

  const addChapterTab = useCallback(
    (scripture, book, chapter, focus = true, viewId = null) => {
      if (views.length > 0) {
        const targetViewId = viewId || getCurrentViewId()

        // Find the target view
        const targetView = views.find((v) => v.id === targetViewId)
        if (!targetView) return

        // Check if the chapter tab already exists
        const existingTabIndex = targetView.tabs.findIndex(
          (tab) =>
            tab.type === "chapter" &&
            tab.scripture.id === scripture.id &&
            tab.book.name === book.name &&
            tab.chapter.num === chapter.num
        )

        if (existingTabIndex !== -1) {
          // Switch to the existing chapter tab
          selectTabInView(targetViewId, existingTabIndex)
          return
        }

        // Create new chapter tab if it doesn't exist
        const tab = {
          type: "chapter",
          book,
          chapter,
          scripture,
          bookIndex: scripture.books.findIndex((bk) => bk.name === book.name),
          scroll: 0,
        }
        addTabToView(targetViewId, tab, focus)
      }
    },
    [views, addTabToView, getCurrentViewId, selectTabInView]
  )

  function compressTab(tab) {
    if (tab.type === "chapter") {
      return [
        "chapter",
        tab.scripture.id,
        tab.bookIndex,
        tab.chapter.num - 1,
        tab.scroll > 0 ? tab.scroll : undefined,
      ]
    } else if (tab.type === "verse") {
      return [
        "verse",
        tab.scripture.id,
        tab.bookIndex,
        tab.chapter.num - 1,
        tab.verse.num,
        tab.scroll > 0 ? tab.scroll : undefined,
      ]
    }
  }

  async function decompressTab(tab) {
    const scripture = await scriptures.load(tab[1])
    const book = scripture.books[tab[2]]
    const chapter = book.chapters[tab[3]]

    if (tab[0] === "chapter") {
      return {
        type: "chapter",
        scripture,
        bookIndex: tab[2],
        book,
        chapter,
        scroll: tab[4] ?? 0,
      }
    } else if (tab[0] === "verse") {
      const verse = chapter.verses.find((v) => v.num === tab[4])
      return {
        type: "verse",
        scripture,
        bookIndex: tab[2],
        book,
        chapter,
        verse,
        scroll: tab[5] ?? 0,
      }
    }
  }

  // Bookmarks
  // =========================================================

  const [bookmarks, setBookmarks] = useState([])

  const addBookmark = useCallback((bookmark) => {
    setBookmarks((prevBookmarks) => {
      const exists = prevBookmarks.some(
        (b) =>
          b.scriptureId === bookmark.scriptureId &&
          b.bookName === bookmark.bookName &&
          b.chapterNum === bookmark.chapterNum &&
          b.verseNum === bookmark.verseNum
      )
      if (exists) return prevBookmarks
      const { timestamp, ...bookmarkNoTimestamp } = bookmark
      return [...prevBookmarks, bookmarkNoTimestamp]
    })
  }, [])

  const removeBookmark = useCallback((bookmark) => {
    setBookmarks((prevBookmarks) =>
      prevBookmarks.filter(
        (b) =>
          !(
            b.scriptureId === bookmark.scriptureId &&
            b.bookName === bookmark.bookName &&
            b.chapterNum === bookmark.chapterNum &&
            b.verseNum === bookmark.verseNum
          )
      )
    )
  }, [])

  const isBookmarked = useCallback(
    (scriptureId, bookName, chapterNum, verseNum) => {
      return bookmarks.some(
        (b) =>
          b.scriptureId === scriptureId &&
          b.bookName === bookName &&
          b.chapterNum === chapterNum &&
          b.verseNum === verseNum
      )
    },
    [bookmarks]
  )

  const copyVerseText = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }, [])

  // Storage & Settings
  // =========================================================

  const [storageMode, setStorageModeState] = useState(() => {
    return localStorage.getItem("bible-explorer-storage-mode") || "url"
  })

  const serializeSettings = () => ({
    views: views.map((view) => ({
      ...view,
      tabs: view.tabs.map(compressTab),
    })),
    selectedTabIndex:
      views.find((v) => v.selectedTabIndex !== undefined)?.selectedTabIndex ??
      0,
    zoomLevel,
    verseWidth,
    bookmarks,
  })

  const deserializeSettings = async (obj) => {
    const loadedViews = []
    for (const view of obj.views || []) {
      const loadedTabs = []
      for (const tab of view.tabs || []) {
        loadedTabs.push(await decompressTab(tab))
      }
      loadedViews.push({
        ...view,
        tabs: loadedTabs,
        selectedTabIndex: obj.selectedTabIndex ?? 0,
      })
    }
    setViews(loadedViews)
    setZoomLevel(obj.zoomLevel ?? 1)
    setVerseWidth(obj.verseWidth ?? 1)
    setBookmarks(obj.bookmarks ?? [])
  }

  const setStorageMode = (mode) => {
    setStorageModeState(mode)
    localStorage.setItem("bible-explorer-storage-mode", mode)
  }

  const migrateStorage = useCallback(
    (toMode) => {
      const obj = JSON.stringify(serializeSettings())
      if (toMode === "local") {
        localStorage.setItem("bible-explorer-settings", obj)
      } else if (toMode === "url") {
        const url = new URL(window.location.href)
        url.hash = ""
        url.searchParams.set("state", encodeURIComponent(btoa(obj)))
        history.replaceState(null, "", url)
      }
      setStorageMode(toMode)
    },
    [views, zoomLevel, verseWidth, bookmarks]
  )

  // Effects
  // =========================================================

  // Initial load.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (storageMode === "local") {
        const saved = localStorage.getItem("bible-explorer-settings")
        if (saved) {
          try {
            const obj = JSON.parse(saved)
            await deserializeSettings(obj)
          } catch {}
        }
      } else if (storageMode === "url") {
        const encoded = new URLSearchParams(window.location.search).get("state")
        if (encoded != undefined) {
          try {
            const obj = JSON.parse(atob(decodeURIComponent(encoded)))
            await deserializeSettings(obj)
          } catch {}
        }
      }
      if (!cancelled) setReadyToUpdateState(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [storageMode])

  // Save state to storage.
  useEffect(() => {
    if (!readyToUpdateState) return
    const obj = serializeSettings()
    if (storageMode === "local") {
      try {
        localStorage.setItem("bible-explorer-settings", JSON.stringify(obj))
      } catch (e) {}
    } else if (storageMode === "url") {
      const url = new URL(window.location.href)
      url.hash = ""
      url.searchParams.set(
        "state",
        encodeURIComponent(btoa(JSON.stringify(obj)))
      )
      history.replaceState(null, "", url)
    }
  }, [storageMode, readyToUpdateState, views, zoomLevel, verseWidth, bookmarks])

  // Listen to the scroll positions of the scripture reader.
  useEffect(() => {
    const onScroll = (e) => {
      setViews((views) =>
        views.map((view) => {
          if (!view.tabs[view.selectedTabIndex]) return view
          view.tabs[view.selectedTabIndex].scroll = e.target.scrollTop
          setScrollLevel((previous) => {
            if (e.target.scrollTop % 10 === 0) {
              return e.target.scrollTop
            }
            return previous
          })
          return view
        })
      )
    }

    if (scriptureReader.current != null) {
      scriptureReader.current.addEventListener("scroll", onScroll)
      return () => {
        if (scriptureReader.current != null) {
          scriptureReader.current.removeEventListener("scroll", onScroll)
        }
      }
    }
  }, [scriptureReader.current])

  // Sync the scroll positions of the scripture reader with the tabs.
  useEffect(() => {
    if (
      views[views.findIndex((v) => v.selectedTabIndex !== undefined)]?.tabs[
        views.findIndex((v) => v.selectedTabIndex !== undefined)
          ?.selectedTabIndex
      ] !== undefined &&
      scriptureReader.current != null
    ) {
      scriptureReader.current.scrollTop = views.find(
        (v) => v.selectedTabIndex !== undefined
      )?.tabs[
        views.find((v) => v.selectedTabIndex !== undefined)?.selectedTabIndex
      ].scroll
    }
  }, [views, scriptureReader.current])
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false)

  // im sorry
  const value = {
    views,
    setViews,
    addTabToView,
    removeTabFromView,
    selectTabInView,
    reorderTabsInView,
    splitTabToNewView,
    resizeView,
    resizeViewsBetween,
    removeView,
    selectedScripture,
    bookSearch,
    barHidden,
    scriptureReader,
    scrollLevel,
    zoomLevel,
    verseWidth,
    readyToUpdateState,
    groups,
    storageMode,
    settingsSidebarOpen,
    bookmarks,

    setSelectedScripture,
    setBookSearch,
    setBarHidden,
    setScrollLevel,
    setZoomLevel,
    setVerseWidth,
    migrateStorage,
    setSettingsSidebarOpen,
    addBookmark,
    removeBookmark,
    isBookmarked,
    copyVerseText,
    addVerseTab,
    addChapterTab,
    getCurrentViewId,

    scriptures,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
