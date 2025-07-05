import { Icon } from "@iconify/react"
import { useMemo } from "react"
import { availableScriptureNames } from "./Scripture"

export default function TranslationSubmenu({
  onSelectTranslation,
  onClose,
  currentScriptureId,
}) {
  const translations = useMemo(() => {
    if (!currentScriptureId) return []

    const currentCategory =
      availableScriptureNames[currentScriptureId]?.category
    if (!currentCategory) return []

    return Object.entries(availableScriptureNames)
      .filter(([id]) => id !== currentScriptureId)
      .filter(([id, { category }]) => category === currentCategory)
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
  }, [currentScriptureId])

  const groupedTranslations = useMemo(() => {
    if (translations.length === 0) return {}

    const category = translations[0][1].category
    return {
      [category]: translations.map(([id, { name }]) => ({ id, name })),
    }
  }, [translations])

  return (
    <div className="absolute left-full top-0 ml-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
      {Object.entries(groupedTranslations).map(([category, translations]) => (
        <div key={category}>
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
            {category}
          </div>
          {translations.map(({ id, name }) => (
            <button
              key={id}
              onClick={() => {
                onSelectTranslation(id)
                onClose()
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              {name}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
