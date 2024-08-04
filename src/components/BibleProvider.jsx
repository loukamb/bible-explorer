import { useEffect } from "react"
import { createContext, useContext, useState } from "react"

const BibleContext = createContext()

export function BibleProvider({ children }) {
  const [bible, setBible] = useState(undefined)
  useEffect(() => {
    ;(async () => {
      // Fetch bible from /public. Cannot inline it into code, sadly.
      setBible(await (await fetch("/bible.json")).json())
    })()
  }, [])
  return (
    <BibleContext.Provider value={bible}>
      {bible !== undefined ? children : <></>}
    </BibleContext.Provider>
  )
}

export function useBible() {
  return useContext(BibleContext)
}
