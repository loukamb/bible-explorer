import fs from "node:fs"
import path from "node:path"

// For processing BibleAPI scripture formats
function processScriptureF1(input, output, id, name) {
  const loadedScripture = JSON.parse(fs.readFileSync(input, "utf-8"))
  if (!fs.existsSync(path.dirname(output))) {
    fs.mkdirSync(path.dirname(output), { recursive: true })
  }

  const processedScripture = {
    id,
    name,
    books: [],
  }

  for (const { name, chapters } of loadedScripture.books) {
    processedScripture.books.push({
      name,
      chapters,
      id: name.replace(/\s/g, "").toLowerCase(),
    })
  }

  fs.writeFileSync(output, JSON.stringify(processedScripture), "utf-8")
}

// For processing LDS scripture formats
function processScriptureF2(input, output, id, name) {
  const loadedScripture = JSON.parse(fs.readFileSync(input, "utf-8"))
  if (!fs.existsSync(path.dirname(output))) {
    fs.mkdirSync(path.dirname(output), { recursive: true })
  }

  const processedScripture = {
    id,
    name,
    books: [],
  }

  for (const { book, chapters } of loadedScripture.books) {
    processedScripture.books.push({
      name: book,
      chapters: chapters.map((chpt) => ({
        num: chpt.chapter,
        verses: chpt.verses.map((v) => ({ text: v.text, num: v.verse })),
      })),
      id: book.replace(/\s/g, "").toLowerCase(),
    })
  }

  fs.writeFileSync(output, JSON.stringify(processedScripture), "utf-8")
}

// For processing LDS D&C format (why isn't it in F2 fmt? idk)
function processScriptureF3(input, output, id, name) {
  const loadedScripture = JSON.parse(fs.readFileSync(input, "utf-8"))
  if (!fs.existsSync(path.dirname(output))) {
    fs.mkdirSync(path.dirname(output), { recursive: true })
  }

  const processedScripture = {
    id,
    name,
    books: [
      {
        name: "Doctrine & Covenants",
        chapters: loadedScripture.sections.map((sct) => ({
          num: sct.section,
          verses: sct.verses.map((v) => ({ text: v.text, num: v.verse })),
        })),
        id: "d&c",
      },
    ],
  }

  fs.writeFileSync(output, JSON.stringify(processedScripture), "utf-8")
}
