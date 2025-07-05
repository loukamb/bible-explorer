import { Icon } from "@iconify/react"
import { useAppContext } from "./AppContext"

export default function VerseButtonBar({
  scriptureId,
  bookName,
  chapterNum,
  verseNum,
  verseText,
  onAddVerseTab,
}) {
  const { addBookmark, removeBookmark, isBookmarked, copyVerseText } =
    useAppContext()

  const bookmarked = isBookmarked(scriptureId, bookName, chapterNum, verseNum)

  const handleBookmarkToggle = () => {
    const bookmark = {
      scriptureId,
      bookName,
      chapterNum,
      verseNum,
      verseText,
    }

    if (bookmarked) {
      removeBookmark(bookmark)
    } else {
      addBookmark(bookmark)
    }
  }

  const handleCopy = () => {
    copyVerseText(verseText)
  }

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 flex gap-1 p-1 bg-white/90 backdrop-blur-sm rounded shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
      <button
        onClick={handleBookmarkToggle}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title={bookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        <Icon
          icon={
            bookmarked
              ? "fluent:bookmark-16-filled"
              : "fluent:bookmark-16-regular"
          }
          className={`text-sm ${
            bookmarked ? "text-blue-600" : "text-gray-600"
          }`}
        />
      </button>
      <button
        onClick={handleCopy}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Copy verse text"
      >
        <Icon icon="fluent:copy-16-regular" className="text-sm text-gray-600" />
      </button>
      <button
        onClick={onAddVerseTab}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Open in new tab"
      >
        <Icon icon="fluent:open-16-regular" className="text-sm text-gray-600" />
      </button>
    </div>
  )
}
