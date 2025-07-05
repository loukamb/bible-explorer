import { useEffect, useRef, useState } from "react"
import { Icon } from "@iconify/react"
import TranslationSubmenu from "./TranslationSubmenu"

export default function TabContextMenu({
  isOpen,
  position,
  onClose,
  onSplitIntoView,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onDuplicateInTranslation,
  currentScriptureId,
  canSplit = true,
  canClose = true,
  canCloseOthers = true,
  canCloseAll = true,
}) {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {canClose && (
        <button
          onClick={() => {
            onCloseTab()
            onClose()
          }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <Icon icon="fluent:dismiss-12-regular" className="text-gray-600" />
          Close tab
        </button>
      )}

      {canCloseOthers && (
        <button
          onClick={() => {
            onCloseOtherTabs()
            onClose()
          }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <Icon
            icon="fluent:dismiss-circle-16-regular"
            className="text-gray-600"
          />
          Close other tabs
        </button>
      )}

      {canCloseAll && (
        <button
          onClick={() => {
            onCloseAllTabs()
            onClose()
          }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <Icon
            icon="fluent:dismiss-square-24-regular"
            className="text-gray-600"
          />
          Close all tabs
        </button>
      )}

      {canSplit && (
        <button
          onClick={() => {
            onSplitIntoView()
            onClose()
          }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <Icon
            icon="fluent:split-horizontal-24-regular"
            className="text-gray-600"
          />
          Split into view
        </button>
      )}

      {onDuplicateInTranslation && currentScriptureId && (
        <div className="group relative">
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Icon
                icon="fluent:document-copy-24-regular"
                className="text-gray-600"
              />
              Duplicate
            </div>
            <Icon
              icon="fluent:chevron-right-12-regular"
              className="text-gray-600"
            />
          </button>
          <div className="absolute left-full top-0 ml-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none group-hover:pointer-events-auto">
            <TranslationSubmenu
              onSelectTranslation={onDuplicateInTranslation}
              onClose={onClose}
              currentScriptureId={currentScriptureId}
            />
          </div>
        </div>
      )}
    </div>
  )
}
