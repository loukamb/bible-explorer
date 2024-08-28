export default function Verse({ id, num, children, subchildren, href, width }) {
  return (
    <div
      key={num}
      className="verse"
      style={{ "--verse-width": width ?? "42rem" }}
    >
      <div>
        <a id={num} className="ref" target="_blank" href={href}>
          <sup>{num}</sup>
        </a>
        {children}
      </div>
      {subchildren}
    </div>
  )
}
