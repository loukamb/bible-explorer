import { useCallback } from "react"
import { useAppContext } from "./AppContext"
import VerseButtonBar from "./VerseButtonBar"

export default function Verse({
  num,
  children,
  width,
  book,
  chapter,
  verseObj,
  className,
  viewId,
}) {
  const { addVerseTab, setBarHidden, scriptures, selectedScripture } =
    useAppContext()

  const handleAddVerseTab = useCallback(() => {
    if (book && chapter && verseObj) {
      addVerseTab(
        scriptures[selectedScripture],
        book,
        chapter,
        verseObj,
        true,
        viewId
      )
      setBarHidden(true)
    }
  }, [
    book,
    chapter,
    verseObj,
    selectedScripture,
    viewId,
    addVerseTab,
    setBarHidden,
  ])

  return (
    <div
      key={num}
      className={`verse group relative ${className}`}
      style={{ "--verse-width": width ?? "42rem" }}
    >
      <div>
        {num && (
          <button
            className="ref text-slate-700 hover:underline focus:underline mr-1 cursor-pointer"
            style={{ padding: 0, background: "none", border: "none" }}
            onClick={handleAddVerseTab}
          >
            <sup>{num}</sup>
          </button>
        )}
        {children}
      </div>

      {book && chapter && verseObj && (
        <VerseButtonBar
          scriptureId={selectedScripture}
          bookName={book.name}
          chapterNum={chapter.num}
          verseNum={verseObj.num}
          verseText={children}
          onAddVerseTab={handleAddVerseTab}
        />
      )}
    </div>
  )
}
