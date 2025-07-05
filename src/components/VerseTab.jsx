import { useAppContext } from "./AppContext"
import Verse from "./Verse"

export default function VerseTab({ tab, viewId }) {
  const {
    verseWidth,
    addChapterTab,
    setBarHidden,
    scriptures,
    selectedScripture,
  } = useAppContext()

  return (
    <div className="mx-auto">
      <h1>
        {tab.book.name} {tab.chapter.num}:{tab.verse.num}
      </h1>
      <Verse
        width={verseWidth === 100 ? "100%" : `${verseWidth / 2 + 42}rem`}
        className="text-center"
        book={tab.book}
        chapter={tab.chapter}
        verseObj={tab.verse}
        viewId={viewId}
      >
        {tab.verse.text}
      </Verse>
      <div className="flex justify-center mt-6">
        <button
          className="px-3 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-sm text-zinc-700"
          onClick={() => {
            addChapterTab(
              scriptures[selectedScripture],
              tab.book,
              tab.chapter,
              true,
              viewId
            )
            setBarHidden(true)
          }}
        >
          Back to chapter
        </button>
      </div>
    </div>
  )
}
