import {
  useState,
  useContext,
  createContext,
  useCallback,
  useMemo,
} from "react"

// Definitions
// ========================================================

interface Scripture {
  readonly id: string
  readonly name: string
  readonly category: string
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
  kjv: "/scriptures/bible/kjv.json",
  niv: "/scriptures/bible/niv.json",
  esv: "/scriptures/bible/esv.json",
  lsb: "/scriptures/bible/lsb.json",
  nasb: "/scriptures/bible/nasb.json",
  nrsvce: "/scriptures/bible/nrsvce.json",
  bom: "/scriptures/book-of-mormon.json",
  "d&c": "/scriptures/doctrine-and-covenants.json",
  pogp: "/scriptures/pearl-of-great-price.json",
}

export const availableScriptureNames = {
  nkjv: { name: "New King James Version", category: "Christian Canon" },
  kjv: { name: "King James Version", category: "Christian Canon" },
  niv: { name: "New International Version", category: "Christian Canon" },
  esv: { name: "English Standard Version", category: "Christian Canon" },
  lsb: { name: "Legacy Standard Bible", category: "Christian Canon" },
  nasb: { name: "New American Standard Bible", category: "Christian Canon" },
  nrsvce: {
    name: "New Revised Standard Version Catholic Edition",
    category: "Christian Canon",
  },
  bom: { name: "Book of Mormon", category: "Latter-day Saints Canon" },
  "d&c": { name: "Doctrine & Covenants", category: "Latter-day Saints Canon" },
  pogp: { name: "Pearl of Great Price", category: "Latter-day Saints Canon" },
} as Record<
  keyof typeof availableScriptures,
  { name: string; category: string }
>

// Logic
// ========================================================

type ScriptureMap = Partial<
  Record<keyof typeof availableScriptures, Scripture | undefined>
>

type ScriptureRegistry = ScriptureMap & { load: any }

const ScripturesContext = createContext<ScriptureRegistry | undefined>(
  undefined
)

export function ScripturesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [map, setMap] = useState<ScriptureMap>({})
  const load = useCallback(
    (id: keyof typeof availableScriptures) => {
      if (!map[id]) {
        return (async () => {
          const fetchedScripture = await (
            await fetch(availableScriptures[id])
          ).json()
          setMap({ ...map, [id]: fetchedScripture })
          return fetchedScripture
        })()
      }
      return (async () => map[id])()
    },
    [map]
  )
  const scriptures = useMemo(() => ({ ...map, load }), [map, load])
  return (
    <ScripturesContext.Provider value={scriptures}>
      {children}
    </ScripturesContext.Provider>
  )
}

export function useScriptures() {
  return useContext(ScripturesContext) as ScriptureRegistry
}
