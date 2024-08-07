import { useState } from "react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

export default function Spoiler({ name, children }) {
  const [shown, setShown] = useState(false)

  return (
    <>
      <button
        className={`spoiler-button ${shown ? "shadow-lg" : "shadow-none"}`}
        onClick={() => setShown((c) => !c)}
      >
        {name}
        <Icon
          className={`ml-auto transition duration-300 ${
            shown ? "rotate-180" : "rotate-0"
          }`}
          icon="fluent:chevron-down-12-regular"
        />
      </button>
      <motion.div
        animate={{
          height: shown ? "auto" : "0",
        }}
        className="spoiler-contents"
      >
        <div className="p-4 grid gap-2 grid-cols-8">{children}</div>
      </motion.div>
    </>
  )
}
