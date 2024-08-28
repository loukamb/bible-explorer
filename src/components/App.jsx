import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Icon } from "@iconify/react"
import { LayoutGroup } from "framer-motion"

import Spoiler from "./Spoiler"
import Verse from "./Verse"
import { useScriptures, availableScriptureNames } from "./Scripture"

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

function Tab({ onClick, onDelete, selected, children }) {
  return (
    <div
      onClick={onClick}
      className={`w-fit group inline-flex items-center gap-1 px-2 py-2 select-none border-y-2 border-transparent ${
        selected ? "border-b-sky-700" : "hover:border-b-sky-700/30"
      }`}
    >
      {children}
      <button
        className={`inline-flex items-center justify-center rounded-full bg-zinc-100 w-4 h-4 text-xs hover:bg-zinc-200 hover:opacity-100 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => (e.stopPropagation(), onDelete())}
      >
        <Icon icon="fluent:dismiss-12-regular" />
      </button>
    </div>
  )
}

function App() {
  // Variables, parameters, etc.
  // ====================================================================

  const scriptures = useScriptures()
  const groups = useMemo(() => {
    const groups = {}
    for (const [id, { name, category }] of Object.entries(
      availableScriptureNames
    )) {
      ;(groups[category ?? "Other"] ||= []).push({ id, name })
    }
    return groups
  }, [scriptures])

  const [tabs, setTabs] = useState([])
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const selectedTab = tabs[selectedTabIndex]
  const tabBar = useHorizontalScroll()

  const [bookSearch, setBookSearch] = useState("")
  const [verseSearch, setVerseSearch] = useState("")
  const [barHidden, setBarHidden] = useState(true)
  const scriptureReader = useRef(null)

  // NOTE: This is only a one-way bind, used for
  // state persistence
  const [scrollLevel, setScrollLevel] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [verseWidth, setVerseWidth] = useState(1)

  const [selectedScripture, setSelectedScripture_internal] = useState("nkjv")
  const setSelectedScripture = useCallback((id) => {
    setSelectedScripture_internal(id)
    scriptures.load(id)
  })

  const [readyToUpdateState, setReadyToUpdateState] = useState(false)

  // Useful functions
  // ====================================================================

  /** Compress a tab */
  function compressTab(tab) {
    return [
      tab.scripture.id,
      tab.bookIndex,
      tab.chapter.num - 1,
      tab.scroll > 0 ? tab.scroll : undefined, // Optional
    ]
  }

  /** Decompress a tab */
  async function decompressTab(tab) {
    const scripture = await scriptures.load(tab[0])
    return {
      scripture,
      bookIndex: tab[1],
      book: scripture.books[tab[1]],
      chapter: scripture.books[tab[1]].chapters[tab[2]],
      scroll: tab[4] ?? 0,
    }
  }

  /** Add a tab */
  const addTab = useCallback(
    (scripture, book, chapter, focus) => {
      const existingTabIndex = tabs.findIndex(
        (t) => t.book === book && t.chapter === chapter
      )
      if (existingTabIndex > -1) {
        setSelectedTabIndex(existingTabIndex)
        return // Window already exists
      }
      setTabs((existingTabs) => [
        ...existingTabs,
        {
          book,
          chapter,
          scripture,
          bookIndex: scripture.books.findIndex((bk) => bk.name === book.name),
          scroll: 0,
        },
      ])
      if (focus) {
        setSelectedTabIndex(tabs.length)
      }
    },
    [tabs, selectedTabIndex]
  )

  /** Delete a tab */
  const removeTab = useCallback(
    (tab) => {
      const index = tabs.findIndex((t) => t === tab)
      const duplicatedTabs = [...tabs]
      duplicatedTabs.splice(index, 1)
      setTabs(duplicatedTabs)
      if (selectedTabIndex >= index) {
        setSelectedTabIndex(selectedTabIndex - 1)
      }
    },
    [tabs, selectedTabIndex]
  )

  // General behavior
  // ====================================================================

  // Import state from url, if it exists.
  useEffect(() => {
    const encodedState = new URLSearchParams(window.location.search).get(
      "state"
    )
    if (encodedState != undefined) {
      const [stateIndex, indices] = JSON.parse(
        atob(decodeURIComponent(encodedState))
      )
      ;(async () => {
        const tabs = []
        for (const tab of indices) {
          tabs.push(await decompressTab(tab))
        }
        setTabs(tabs)
        setSelectedTabIndex(stateIndex)
        setSelectedScripture(indices[stateIndex][0])
        setReadyToUpdateState(true)
      })()
    } else {
      setReadyToUpdateState(true)
    }
  }, [])

  // Update state in URL when updating is ready.
  useEffect(() => {
    if (readyToUpdateState) {
      const url = new URL(window.location.href)
      url.hash = "" // Get rid of the hash when the state updates

      if (tabs.length > 0) {
        url.searchParams.set(
          "state",
          encodeURIComponent(
            btoa(JSON.stringify([selectedTabIndex, tabs.map(compressTab)]))
          )
        )
      } else {
        url.searchParams.delete("state")
      }
      history.replaceState(null, "", url)
    }
  }, [readyToUpdateState, tabs, selectedTabIndex, scrollLevel])

  // Per-tab scroll persistence.
  useEffect(() => {
    const onScroll = (e) => {
      // HACK: Setters shouldn't be used to get current values,
      // but this works specifically for our purposes lol
      setSelectedTabIndex((index) => {
        setTabs((tabs) => {
          tabs[index].scroll = e.target.scrollTop
          setScrollLevel((previous) => {
            if (e.target.scrollTop % 10 === 0) {
              return e.target.scrollTop
            }
            return previous
          })
          return tabs
        })
        return index
      })
    }
    if (scriptureReader.current != null) {
      scriptureReader.current.addEventListener("scroll", onScroll)
      return () =>
        scriptureReader.current.removeEventListener("scroll", onScroll)
    }
  }, [scriptureReader.current])

  // Updated scroll on tab selection
  useEffect(() => {
    if (tabs[selectedTabIndex] !== undefined) {
      if (scriptureReader.current != null) {
        scriptureReader.current.scrollTop = selectedTab.scroll
      }
    }
  }, [tabs, selectedTabIndex, scriptureReader.current])

  // Load NKJV by default
  useEffect(() => {
    scriptures.load("nkjv")
  }, [])

  // Actual component lol
  // ====================================================================

  return (
    <>
      <div className="h-screen w-screen max-w-[100vw] max-h-screen flex">
        <div
          className={`absolute left-0 top-0 w-screen h-screen z-40 transition duration-300 ${
            barHidden
              ? "pointer-events-none backdrop-blur-0 bg-transparent"
              : "pointer-events-auto backdrop-blur-sm "
          }`}
          onClick={() => setBarHidden(true)}
        />

        <div
          className={`${
            barHidden ? "-translate-x-full" : "translate-x-0"
          } duration-300 lg:w-[24rem] lg:min-w-[24rem] w-[80%] min-w-[80%] absolute z-50 transition h-full overflow-y-scroll bg-zinc-100 text-zinc-950 scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent scrollbar-corner-transparent`}
        >
          <div className="flex items-center border-b group border-zinc-300 focus:bg-zinc-200 hover:bg-zinc-200 px-4 py-2 gap-2 transition">
            <Icon icon="fluent:book-16-regular" />
            <select
              className="w-full bg-zinc-100 group-hover:bg-inherit placeholder-zinc-500 outline-none font-sans"
              value={selectedScripture}
              onChange={(e) => setSelectedScripture(e.target.value)}
            >
              {Object.entries(groups).map(([scriptureGroup, scriptures]) => (
                <optgroup label={scriptureGroup} key={scriptureGroup}>
                  {Object.entries(scriptures).map(([, { id, name }]) => (
                    <option value={id} key={id}>
                      {name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button className="inline" onClick={() => setBarHidden(true)}>
              <Icon icon="fluent:dismiss-12-regular" />
            </button>
          </div>
          <input
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value.trim().toLowerCase())}
            placeholder="Search"
            className="w-full bg-inherit placeholder-zinc-500 focus:bg-zinc-200 hover:bg-zinc-200 border-b border-zinc-300 outline-none font-sans p-4 transition"
          />
          <div>
            {scriptures[selectedScripture] ? (
              <LayoutGroup>
                {scriptures[selectedScripture].books.map(
                  (book) =>
                    (bookSearch === "" ||
                      book.name.toLowerCase().includes(bookSearch)) && (
                      <Spoiler key={book.name} name={book.name}>
                        {book.chapters.map((chapter, i) => (
                          <button
                            key={i + 1}
                            className="link-to-chapter"
                            onClick={() => {
                              addTab(
                                scriptures[selectedScripture],
                                book,
                                chapter,
                                true
                              )
                              setBarHidden(true)
                            }}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </Spoiler>
                    )
                )}
              </LayoutGroup>
            ) : (
              <div className="flex items-center justify-center">
                <Icon icon="svg-spinners:180-ring" />
              </div>
            )}
          </div>
        </div>
        <main className="flex flex-col h-full w-0 grow">
          <nav className="flex items-center bg-zinc-100 shadow-lg h-10">
            <button
              className="w-fit inline-block px-4 py-3 hover:bg-zinc-300 cursor-default transition"
              onClick={() => setBarHidden((c) => !c)}
            >
              <Icon icon="fluent:book-16-regular" />
            </button>
            <div
              ref={tabBar}
              className="whitespace-nowrap overflow-auto scrollbar-none"
            >
              {!readyToUpdateState && <Icon icon="svg-spinners:180-ring" />}
              {tabs.map((tab, i) => (
                <Tab
                  key={`${tab.scripture.id}:${tab.book.name}:${tab.chapter.num}`}
                  onClick={() => (
                    setSelectedScripture(tab.scripture.id),
                    setSelectedTabIndex(i)
                  )}
                  onDelete={() => removeTab(tab)}
                  selected={selectedTabIndex === i}
                >
                  <span className="text-xs bg-zinc-100 px-0.5 rounded-md text-zinc-950 shadow-md border-2 border-zinc-400">
                    {tab.scripture.id.toUpperCase()}
                  </span>{" "}
                  {tab.book.name} {tab.chapter.num}
                </Tab>
              ))}
            </div>
            <div className="md:flex gap-4 hidden ml-auto p-4">
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
            </div>
          </nav>
          <div
            ref={scriptureReader}
            className="reader"
            style={{ zoom: `${zoomLevel + 100}%` }}
          >
            <div className="mx-auto">
              {selectedTab !== undefined && (
                <>
                  <h1>
                    {selectedTab.book.name} {selectedTab.chapter.num}
                  </h1>
                  <input
                    value={verseSearch}
                    onChange={(e) =>
                      setVerseSearch(e.target.value.trim().toLowerCase())
                    }
                    placeholder="Search"
                    className="sticky backdrop-blur-lg bg-white/50 -top-12 w-full z-30 placeholder-zinc-400 focus:bg-zinc-100/50 border border-zinc-300 hover:shadow-md outline-none font-sans rounded-lg p-2 text-xl mb-8"
                  />
                  {selectedTab.chapter.verses.map(
                    (verse) =>
                      (verseSearch === "" ||
                        verse.text.toLowerCase().includes(verseSearch)) && (
                        <Verse
                          key={verse.num}
                          num={verse.num}
                          width={
                            verseWidth === 100
                              ? "100%"
                              : `${verseWidth / 2 + 42}rem`
                          }
                          href={`https://bible.louka.sh/${selectedTab.book.id}/${selectedTab.chapter.num}/${verse.num}`}
                        >
                          {verse.text}
                        </Verse>
                      )
                  )}
                </>
              )}
            </div>
          </div>
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
    </>
  )
}

export default App
