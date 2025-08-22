import { SDGIcons } from "./SDGIcons"

export default function SDGSegment({ angle, color, icon, title, radius, center, startAngle, endAngle, isSelected }) {
  // Calculate arc points
  const x1 = center.x + radius * Math.cos(startAngle)
  const y1 = center.y + radius * Math.sin(startAngle)
  const x2 = center.x + radius * Math.cos(endAngle)
  const y2 = center.y + radius * Math.sin(endAngle)
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

  const pathData = [
    `M ${center.x} ${center.y}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    "Z",
  ].join(" ")

  // Calculate positions for icon and text
  const iconAngle = (startAngle + endAngle) / 2
  const iconRadius = radius * 0.75
  const textRadius = radius * 0.55

  const iconX = center.x + iconRadius * Math.cos(iconAngle)
  const iconY = center.y + iconRadius * Math.sin(iconAngle)

  const textX = center.x + textRadius * Math.cos(iconAngle)
  const textY = center.y + textRadius * Math.sin(iconAngle)

  return (
    <g>
      {/* Gradient definition for each segment */}
      <defs>
        <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
        <filter id={`shadow-${title}`}>
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main segment path with gradient and shadow */}
      <path
        d={pathData}
        fill={`url(#gradient-${title})`}
        stroke="#ffffff"
        strokeWidth={isSelected ? 4 : 2}
        opacity={isSelected ? 1 : 0.9}
        filter={`url(#shadow-${title})`}
        style={{
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
      />

      {/* Highlight overlay for selected segment */}
      {isSelected && (
        <path
          d={pathData}
          fill="rgba(255, 255, 255, 0.2)"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Modern SVG icon */}
      <g transform={`translate(${iconX - radius * 0.08}, ${iconY - radius * 0.08})`}>
        <foreignObject width={radius * 0.16} height={radius * 0.16} style={{ pointerEvents: "none" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              color: "white",
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.5))",
            }}
          >
            {SDGIcons[title]}
          </div>
        </foreignObject>
      </g>

      {/* Enhanced typography for SDG number */}
      <text
        x={textX}
        y={textY}
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize={radius * 0.12}
        fontWeight="600"
        fill="#ffffff"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="1"
        style={{
          pointerEvents: "none",
          fontFamily: "'Oswald', 'Arial Black', sans-serif",
          letterSpacing: "0.5px",
          filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.7))",
        }}
      >
        {title}
      </text>

      {/* Subtle decorative ring around the segment */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
        strokeDasharray="2,2"
        opacity="0.6"
        style={{ pointerEvents: "none" }}
      />
    </g>
  )
}
