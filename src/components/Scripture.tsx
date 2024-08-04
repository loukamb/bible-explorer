import { useState, useEffect, useContext, createContext } from "react"

// Definitions
// ========================================================

interface Scripture {
  readonly id: string
  readonly name: string
  readonly books: readonly ScriptureBook[]
}

interface ScriptureBook {
  readonly id: string
  readonly name: string
  readonly chapters: readonly ScriptureChapter[]
}

interface ScriptureChapter {
  readonly num: number
  readonly verses: readonly ScriptureVerse[]
}

interface ScriptureVerse {
  readonly num: number
  readonly text: string
}

// Paths to available scriptures
// ========================================================

const availableScriptures = {
  nkjv: "/scriptures/bible/nkjv.json",
  //esv: "/scriptures/bible/esv.json",
  bom: "/scriptures/book-of-mormon.json",
  "d&c": "/scriptures/doctrine-and-covenants.json",
  pogp: "/scriptures/pearl-of-great-price.json",
}

// Logic
// ========================================================

type ScriptureRegistry = Partial<
  Record<keyof typeof availableScriptures, Scripture>
>
const ScripturesContext = createContext<ScriptureRegistry | undefined>(
  undefined
)

export function ScripturesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [scriptures, setScriptures] = useState<ScriptureRegistry | undefined>(
    undefined
  )
  useEffect(() => {
    ;(async () => {
      const registry = {} as ScriptureRegistry
      for (const [scriptureId, scripturePath] of Object.entries(
        availableScriptures
      )) {
        registry[scriptureId as keyof ScriptureRegistry] = await (
          await fetch(scripturePath)
        ).json()
      }
      setScriptures(registry)
    })()
  }, [])
  return (
    <ScripturesContext.Provider value={scriptures}>
      {scriptures !== undefined ? children : <></>}
    </ScripturesContext.Provider>
  )
}

export function useScriptures() {
  return useContext(ScripturesContext) as Required<ScriptureRegistry>
}
