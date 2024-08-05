import { useState, useEffect, useCallback, useRef } from "react"
import { Icon } from "@iconify/react"

import Spoiler from "./Spoiler"
import { useScriptures } from "./Scripture"

function Tab({ onClick, onDelete, selected, children }) {
  return (
    <div
      onClick={onClick}
      className={`w-fit inline-block px-2 py-2 select-none ${
        selected ? "bg-slate-600" : ""
      }`}
    >
      {children}
      <button
        className="inline-flex items-center justify-center rounded-full bg-slate-800/50 w-5 h-5 ml-1 text-xs hover:bg-slate-800"
        onClick={(e) => (e.stopPropagation(), onDelete())}
      >
        <Icon icon="fluent:delete-12-regular" />
      </button>
    </div>
  )
}

function App() {
  const scriptures = useScriptures()

  // Variables, parameters, etc.
  // ====================================================================

  const [tabs, setTabs] = useState([])
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const selectedTab = tabs[selectedTabIndex]

  const [bookSearch, setBookSearch] = useState("")
  const [verseSearch, setVerseSearch] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [barHidden, setBarHidden] = useState(false)
  const [selectedScripture, setSelectedScripture] = useState("nkjv")
  const scriptureSelector = useRef(null)

  const [readyToUpdateState, setReadyToUpdateState] = useState(false)

  // Useful functions
  // ====================================================================

  /**
   * Add a new tab.
   */
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
          id: book.id,
          index: scripture.books.findIndex((bk) => bk.name === book.name),
        },
      ])
      if (focus) {
        setSelectedTabIndex(tabs.length)
      }
    },
    [tabs, selectedTabIndex]
  )

  /**
   * Delete a tab.
   */
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
      setTabs(
        indices.map((tab) => ({
          scripture: scriptures[tab[0]],
          index: tab[1],
          book: scriptures[tab[0]].books[tab[1]],
          chapter: scriptures[tab[0]].books[tab[1]].chapters[tab[2]],
          id: scriptures[tab[0]].books[tab[1]].id,
        }))
      )
      setSelectedTabIndex(stateIndex)
      setSelectedScripture(indices[stateIndex][0])
    }
    setReadyToUpdateState(true)
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
            btoa(
              JSON.stringify([
                selectedTabIndex,
                tabs.map((tab) => [
                  tab.scripture.id,
                  tab.index,
                  tab.chapter.num - 1,
                ]),
              ])
            )
          )
        )
      } else {
        url.searchParams.delete("state")
      }
      history.replaceState(null, "", url)
    }
  }, [readyToUpdateState, tabs, selectedTabIndex])

  // Actual component lol
  // ====================================================================

  return (
    <>
      <div className="h-screen w-screen max-h-screen flex">
        <div
          className={`${
            barHidden ? "hidden" : "block"
          } w-1/6 h-full overflow-y-scroll bg-slate-700 text-slate-50 scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-transparent scrollbar-corner-transparent`}
        >
          <div
            onClick={() => scriptureSelector.current?.click()}
            className="flex items-center border-b border-slate-500 focus:bg-slate-600 hover:bg-slate-600 px-4 py-2 gap-2"
          >
            <Icon icon="fluent:book-16-regular" />
            <select
              ref={scriptureSelector}
              className="w-full bg-inherit placeholder-slate-500 outline-none font-sans"
              value={selectedScripture}
              onChange={(e) => setSelectedScripture(e.target.value)}
            >
              {Object.entries(scriptures).map(([, scriptureValue]) => (
                <option value={scriptureValue.id}>{scriptureValue.name}</option>
              ))}
            </select>
          </div>
          <input
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value.trim().toLowerCase())}
            placeholder="Search"
            className="w-full bg-inherit placeholder-slate-500 focus:bg-slate-600 hover:bg-slate-600 border-b border-slate-500 outline-none font-sans p-4 transition"
          />
          {scriptures[selectedScripture].books.map(
            (book) =>
              (bookSearch === "" ||
                book.name.toLowerCase().includes(bookSearch)) && (
                <Spoiler key={book.name} name={book.name}>
                  {book.chapters.map((chapter, i) => (
                    <button
                      key={i + 1}
                      className="link-to-chapter"
                      onClick={() =>
                        addTab(
                          scriptures[selectedScripture],
                          book,
                          chapter,
                          true
                        )
                      }
                    >
                      {i + 1}
                    </button>
                  ))}
                </Spoiler>
              )
          )}
        </div>
        <main className="flex flex-col grow h-full w-full">
          <nav className="flex items-center bg-slate-800 h-10">
            <button
              className="w-fit inline-block px-4 py-3 hover:bg-slate-600"
              onClick={() => setBarHidden((c) => !c)}
            >
              <Icon
                className={barHidden ? "rotate-180" : "rotate-0"}
                icon="fluent:arrow-left-12-regular"
              />
            </button>
            <div className="overflow-x-scroll scrollbar-none">
              {tabs.map((tab, i) => (
                <Tab
                  key={`${tab.book.name}:${tab.chapter.num}`}
                  onClick={() => (
                    setSelectedScripture(tab.scripture.id),
                    setSelectedTabIndex(i)
                  )}
                  onDelete={() => removeTab(tab)}
                  selected={selectedTabIndex === i}
                >
                  <span className="text-xs bg-slate-900 px-1 rounded-md text-white/80">
                    {tab.scripture.id.toUpperCase()}
                  </span>{" "}
                  {tab.book.name} {tab.chapter.num}
                </Tab>
              ))}
            </div>
            <div className="flex items-center ml-auto p-4">
              <Icon icon="fluent:search-12-regular" className="mr-2" />
              <input
                type="range"
                min={1}
                max={100}
                value={zoomLevel}
                onChange={(e) => setZoomLevel(e.target.valueAsNumber)}
              />
            </div>
          </nav>
          <div className="reader" style={{ zoom: `${zoomLevel + 100}%` }}>
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
                    className="sticky backdrop-blur-lg bg-slate-950/50 shadow-lg -top-12 w-full z-50 placeholder-slate-700 focus:bg-slate-800 hover:bg-slate-900 border border-slate-700 outline-none font-sans rounded-lg p-2 text-xl mb-8"
                  />
                  {selectedTab.chapter.verses.map(
                    (verse) =>
                      (verseSearch === "" ||
                        verse.text.toLowerCase().includes(verseSearch)) && (
                        <div key={verse.num} className="verse">
                          <a
                            id={verse.num}
                            className="ref"
                            target="_blank"
                            href={`https://bible.louka.sh/${selectedTab.id}/${selectedTab.chapter.num}/${verse.num}`}
                          >
                            <sup>{verse.num}</sup>
                          </a>
                          {verse.text}
                        </div>
                      )
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex mt-auto bg-slate-800 px-4 py-2 text-sm gap-1">
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
            <span className="ml-auto">
              This work has been released into the public domain.
            </span>
          </div>
        </main>
      </div>
    </>
  )
}

export default App
