// Scrapper for downloading versions off a Certain Bible Website.
// Domains removed, figure it out for yourself if you want to use this.

import { promises as fs } from "node:fs"
import { parse } from "node-html-parser"

async function sleep(n) {
  await new Promise((resolve) => setTimeout(resolve, n))
}

async function getBible(name, category, version) {
  // Retrieve book listing for version.
  const bookData = (
    await (
      await fetch(
        `https://www.REPLACE DOMAIN HERE.com/passage/bcv/?version=${version}`
      )
    ).json()
  ).data[0].map(({ display, osis, num_chapters }) => [
    display,
    osis,
    num_chapters,
  ])

  // Start retrieving verses. Done in batches of 10, per site retrieval limit.
  const books = []

  for (const [bookName, bookInternalId, bookChapters] of bookData) {
    console.log(
      `Processing ${bookName} (${bookInternalId}) with ${bookChapters} chapters`
    )

    const book = {
      name: bookName,
      id: bookName.replace(/\s/g, "").toLowerCase(),
      chapters: [],
    }

    // Chapter indice
    let chapterRangeStart = 1

    // Limited to 10 chapters at a time.
    while (chapterRangeStart <= bookChapters) {
      console.log(
        `Processing ${bookName} ${chapterRangeStart}-${Math.min(
          chapterRangeStart + 10,
          bookChapters
        )}`
      )

      const pageRawData = await (
        await fetch(
          `https://www.REPLACE DOMAIN HERE.com/passage/?search=${bookName.replace(
            /\s/g,
            "+"
          )}+${chapterRangeStart}-${Math.min(
            chapterRangeStart + 10,
            bookChapters
          )}&version=${version}`
        )
      ).text()

      // Parse the page HTML.
      const parsedPage = parse(pageRawData)

      // Retrieve all verse elements, thankfully pretty easy.
      const verseElements = parsedPage.querySelectorAll(
        `*:not(h3) > span[class*='${bookInternalId}-' i]`
      )

      // Compute chapters and verses
      for (const verseElement of verseElements) {
        // Compute chapter and verse IDs.
        const [, chapterStr, verseStr] =
          verseElement.classList.value[1].split("-")
        const [chapterId, verseId] = [parseInt(chapterStr), parseInt(verseStr)]

        // Prepare chapter object, creating it if it doesn't exist
        const chapter = (book.chapters[chapterId - 1] ||= {
          num: chapterId,
          verses: [],
        })

        // Remove bullshit elements, if they exist
        verseElement
          .querySelectorAll(
            ".versenum, .chapternum, .crossreference, .footnote"
          )
          .forEach((e) => e.remove())

        // Pipe verse contents into a single string.
        const verseText = verseElement.text

        // Append content to existing verse, or create it
        ;(chapter.verses[verseId - 1] ||= { num: verseId, text: "" }).text +=
          verseText + " "
      }

      // Compute the next chapter indice
      chapterRangeStart =
        parseInt(
          parsedPage.querySelector(".dropdown-display-text").text.split("-")[1]
        ) + 1

      // Let's make sure we're not parsing too fast and get banned.
      await sleep(100)
    }

    books.push(book)
  }

  // Prepare version for export.
  const bible = { name, category, id: version.toLowerCase(), books }
  await fs.writeFile(
    `./public/scriptures/bible/${bible.id}.json`,
    JSON.stringify(bible, undefined, 4),
    "utf-8"
  )
}

/*
example of use

await getBible(
  "New Revised Standard Version Catholic Edition",
  "Christian Canon",
  "NRSVCE"
).catch(console.error)
*/
