import { useState, useEffect, useContext, createContext } from "react"

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

const availableScripturesMap = Object.entries(availableScriptures)

// Loading
// ========================================================

import { Icon } from "@iconify/react"

function Loading({ value, max }: { value: number; max: number }) {
  return (
    <div className="w-screen h-screen flex flex-col gap-4 items-center justify-center">
      <Icon className="text-6xl" icon="svg-spinners:3-dots-move" />
      <div className="text-xl">
        Loading scriptures {value}/{max}
      </div>
      <div className="opacity-50">
        Problems?{" "}
        <a
          className="underline"
          href="https://github.com/loukamb/bible-explorer/issues"
        >
          File a bug report.
        </a>
      </div>
    </div>
  )
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
  const [count, setCount] = useState(0)
  useEffect(() => {
    ;(async () => {
      const registry = {} as ScriptureRegistry
      for (const [scriptureId, scripturePath] of availableScripturesMap) {
        registry[scriptureId as keyof ScriptureRegistry] = await (
          await fetch(scripturePath)
        ).json()
        setCount((c) => c + 1)
      }
      setScriptures(registry)
    })()
  }, [])
  return (
    <ScripturesContext.Provider value={scriptures}>
      {scriptures !== undefined ? (
        children
      ) : (
        <Loading value={count} max={availableScripturesMap.length} />
      )}
    </ScripturesContext.Provider>
  )
}

export function useScriptures() {
  return useContext(ScripturesContext) as Required<ScriptureRegistry>
}
