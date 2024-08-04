import { useState } from "react"

export default function Spoiler({ name, children }) {
  const [shown, setShown] = useState(false)

  return (
    <>
      <button className="spoiler-button" onClick={() => setShown((c) => !c)}>
        {name}
      </button>
      {shown && <div className="spoiler-contents">{children}</div>}
    </>
  )
}
