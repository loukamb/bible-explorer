import { useAppContext } from "./AppContext"
import Spoiler from "./Spoiler"
import { Icon } from "@iconify/react"

export default function BookmarksSection() {
  const {
    bookmarks,
    removeBookmark,
    addVerseTab,
    setBarHidden,
    scriptures,
    getCurrentViewId,
  } = useAppContext()

  const handleBookmarkClick = (bookmark) => {
    const scripture = scriptures[bookmark.scriptureId]
    if (!scripture) return

    const book = scripture.books.find((b) => b.name === bookmark.bookName)
    if (!book) return

    const chapter = book.chapters.find((c) => c.num === bookmark.chapterNum)
    if (!chapter) return

    const verse = chapter.verses.find((v) => v.num === bookmark.verseNum)
    if (!verse) return

    addVerseTab(scripture, book, chapter, verse, true, getCurrentViewId())
    setBarHidden(true)
  }

  const handleRemoveBookmark = (bookmark) => {
    removeBookmark(bookmark)
  }

  if (bookmarks.length === 0) {
    return (
      <Spoiler name="Bookmarks" contentsClassName="p-4 flex flex-col gap-2">
        <div className="text-center text-gray-500 py-4">
          No bookmarks yet. Hover over a verse to add bookmarks.
        </div>
      </Spoiler>
    )
  }

  return (
    <Spoiler
      name={`Bookmarks (${bookmarks.length})`}
      contentsClassName="p-4 flex flex-col gap-2"
    >
      <div className="space-y-2">
        {bookmarks
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((bookmark, index) => (
            <div
              key={`${bookmark.scriptureId}-${bookmark.bookName}-${bookmark.chapterNum}-${bookmark.verseNum}`}
              className="group relative flex flex-col bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
            >
              <button
                onClick={() => handleBookmarkClick(bookmark)}
                className="flex-1 w-full h-full text-left hover:bg-gray-50 focus:bg-gray-100 rounded p-3 transition-colors z-0"
                tabIndex={0}
                aria-label={`Go to ${bookmark.bookName} ${bookmark.chapterNum}:${bookmark.verseNum}`}
              >
                <div className="font-medium text-sm">
                  {bookmark.bookName} {bookmark.chapterNum}:{bookmark.verseNum}
                </div>
                <div className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {bookmark.verseText}
                </div>
              </button>
              <button
                onClick={() => handleRemoveBookmark(bookmark)}
                className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove bookmark"
                tabIndex={0}
              >
                <Icon
                  icon="fluent:dismiss-12-regular"
                  className="text-sm text-red-500"
                />
              </button>
            </div>
          ))}
      </div>
    </Spoiler>
  )
}
