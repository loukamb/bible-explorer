import { useState } from "react"
import { useAppContext } from "./AppContext"
import Verse from "./Verse"

export default function ChapterTab({ tab, viewId }) {
  const { verseWidth } = useAppContext()
  const [verseSearch, setVerseSearch] = useState("")

  return (
    <div className="mx-auto">
      <h1>
        {tab.book.name} {tab.chapter.num}
      </h1>
      <input
        value={verseSearch}
        onChange={(e) => setVerseSearch(e.target.value.trim().toLowerCase())}
        placeholder="Search verses"
        className="sticky backdrop-blur-lg bg-white/50 -top-12 w-full z-30 placeholder-zinc-400 focus:bg-zinc-100/50 border border-zinc-300 hover:shadow-md outline-none font-sans rounded-lg p-2 text-xl mb-8"
      />
      {tab.chapter.verses.map(
        (verse) =>
          (verseSearch === "" ||
            verse.text.toLowerCase().includes(verseSearch)) && (
            <Verse
              key={verse.num}
              num={verse.num}
              width={verseWidth === 100 ? "100%" : `${verseWidth / 2 + 42}rem`}
              book={tab.book}
              chapter={tab.chapter}
              verseObj={verse}
              viewId={viewId}
            >
              {verse.text}
            </Verse>
          )
      )}
    </div>
  )
}
