export default function Verse({ id, num, children, subchildren, href }) {
  return (
    <div key={num} className="verse">
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
