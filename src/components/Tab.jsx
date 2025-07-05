import { Icon } from "@iconify/react"

export default function Tab({
  onClick,
  onDelete,
  selected,
  children,
  onDragStart,
  onDragOver,
  onDrop,
  onContextMenu,
  index,
  isDragging,
  isDragOver,
}) {
  return (
    <div
      onClick={onClick}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onContextMenu={onContextMenu}
      className={`w-fit group inline-flex items-center gap-1 px-2 py-2 select-none border-y-2 border-transparent cursor-grab active:cursor-grabbing ${
        selected ? "border-b-sky-700" : "hover:border-b-sky-700/30"
      } ${isDragging ? "opacity-50" : ""} ${
        isDragOver ? "border-b-blue-500 border-b-2" : ""
      }`}
    >
      {children}
      <button
        className={`inline-flex items-center justify-center rounded-full bg-zinc-100 w-4 h-4 text-xs hover:bg-zinc-200 hover:opacity-100 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => (e.stopPropagation(), onDelete())}
      >
        <Icon icon="fluent:dismiss-12-regular" />
      </button>
    </div>
  )
}
