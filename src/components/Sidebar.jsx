import { Icon } from "@iconify/react"
import { LayoutGroup } from "motion/react"
import { useAppContext } from "./AppContext"
import Spoiler from "./Spoiler"
import BookmarksSection from "./BookmarksSection"

export default function Sidebar() {
  const {
    selectedScripture,
    setSelectedScripture,
    bookSearch,
    setBookSearch,
    barHidden,
    setBarHidden,
    scriptures,
    groups,
    views,
    addTabToView,
  } = useAppContext()

  return (
    <>
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
          placeholder="Search books"
          className="w-full bg-inherit placeholder-zinc-500 focus:bg-zinc-200 hover:bg-zinc-200 border-b border-zinc-300 outline-none font-sans p-4 transition"
        />
        <div className="border-b border-zinc-300">
          <BookmarksSection />
        </div>
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
                            if (views.length > 0) {
                              const tab = {
                                type: "chapter",
                                book,
                                chapter,
                                scripture: scriptures[selectedScripture],
                                bookIndex: scriptures[
                                  selectedScripture
                                ].books.findIndex(
                                  (bk) => bk.name === book.name
                                ),
                                scroll: 0,
                              }
                              addTabToView(views[0].id, tab)
                            }
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
    </>
  )
}
