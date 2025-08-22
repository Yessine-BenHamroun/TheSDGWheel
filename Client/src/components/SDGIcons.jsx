// Official UN SDG Icons with proper designs and colors
export const SDGIcons = {
  1: ( // No Poverty - House/Home symbol
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      <defs>
        <style>{`
          .oswald-text { font-family: 'Oswald', 'Arial Black', sans-serif; font-weight: 600; }
        `}</style>
      </defs>
      {/* House icon */}
      <path d="M50 15L20 35v45h15V60h20v20h15V35L50 15z" fill="white" stroke="none" />
      <path d="M35 65h10v10h-10z" fill="#e5243b" />
      <path d="M55 65h10v10h-10z" fill="#e5243b" />
      <circle cx="42" cy="52" r="2" fill="#e5243b" />
    </svg>
  ),
  2: ( // Zero Hunger - Wheat/Bowl symbol
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Bowl */}
      <ellipse cx="50" cy="65" rx="25" ry="8" fill="white" />
      <path d="M25 65 Q25 75 50 75 Q75 75 75 65" fill="white" />
      {/* Wheat stalks */}
      <path d="M35 45 Q35 35 40 30 Q45 35 45 45" fill="white" stroke="white" strokeWidth="2" />
      <path d="M50 40 Q50 30 55 25 Q60 30 60 40" fill="white" stroke="white" strokeWidth="2" />
      <path d="M65 45 Q65 35 70 30 Q75 35 75 45" fill="white" stroke="white" strokeWidth="2" />
      {/* Grain details */}
      <circle cx="37" cy="38" r="1.5" fill="white" />
      <circle cx="43" cy="38" r="1.5" fill="white" />
      <circle cx="52" cy="33" r="1.5" fill="white" />
      <circle cx="58" cy="33" r="1.5" fill="white" />
      <circle cx="67" cy="38" r="1.5" fill="white" />
      <circle cx="73" cy="38" r="1.5" fill="white" />
    </svg>
  ),
  3: ( // Good Health - Heart with cross
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Heart shape */}
      <path
        d="M50 75 C30 60 15 45 15 30 C15 20 25 15 35 20 C40 22 45 25 50 30 C55 25 60 22 65 20 C75 15 85 20 85 30 C85 45 70 60 50 75 Z"
        fill="white"
      />
      {/* Medical cross */}
      <rect x="46" y="35" width="8" height="20" fill="#4C9F38" />
      <rect x="40" y="41" width="20" height="8" fill="#4C9F38" />
    </svg>
  ),
  4: ( // Quality Education - Book/Graduation cap
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Open book */}
      <path d="M20 30 Q20 25 25 25 L75 25 Q80 25 80 30 L80 70 Q80 75 75 75 L25 75 Q20 75 20 70 Z" fill="white" />
      <line x1="50" y1="25" x2="50" y2="75" stroke="#C5192D" strokeWidth="2" />
      {/* Book pages/lines */}
      <line x1="30" y1="35" x2="45" y2="35" stroke="#C5192D" strokeWidth="1.5" />
      <line x1="30" y1="42" x2="45" y2="42" stroke="#C5192D" strokeWidth="1.5" />
      <line x1="30" y1="49" x2="45" y2="49" stroke="#C5192D" strokeWidth="1.5" />
      <line x1="55" y1="35" x2="70" y2="35" stroke="#C5192D" strokeWidth="1.5" />
      <line x1="55" y1="42" x2="70" y2="42" stroke="#C5192D" strokeWidth="1.5" />
      <line x1="55" y1="49" x2="70" y2="49" stroke="#C5192D" strokeWidth="1.5" />
      {/* Graduation cap on top */}
      <polygon points="35,20 65,20 70,15 30,15" fill="white" />
      <circle cx="70" cy="17" r="2" fill="white" />
    </svg>
  ),
  5: ( // Gender Equality - Male/Female symbols balanced
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Balance scale base */}
      <rect x="47" y="60" width="6" height="25" fill="white" />
      <ellipse cx="50" cy="85" rx="15" ry="3" fill="white" />
      {/* Left scale (female symbol) */}
      <circle cx="30" cy="35" r="8" fill="white" />
      <line x1="30" y1="43" x2="30" y2="55" stroke="white" strokeWidth="3" />
      <line x1="25" y1="50" x2="35" y2="50" stroke="white" strokeWidth="3" />
      {/* Right scale (male symbol) */}
      <circle cx="70" cy="35" r="8" fill="white" />
      <line x1="76" y1="29" x2="82" y2="23" stroke="white" strokeWidth="3" />
      <line x1="78" y1="23" x2="82" y2="23" stroke="white" strokeWidth="3" />
      <line x1="82" y1="23" x2="82" y2="27" stroke="white" strokeWidth="3" />
      {/* Balance beam */}
      <line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="4" />
      <line x1="50" y1="50" x2="50" y2="60" stroke="white" strokeWidth="3" />
    </svg>
  ),
  6: ( // Clean Water - Water drop with waves
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Large water drop */}
      <path d="M50 20 C40 30 30 45 30 60 C30 72 38 80 50 80 C62 80 70 72 70 60 C70 45 60 30 50 20 Z" fill="white" />
      {/* Inner water highlight */}
      <ellipse cx="45" cy="55" rx="8" ry="12" fill="#26BDE2" opacity="0.7" />
      {/* Water waves at bottom */}
      <path d="M20 85 Q30 80 40 85 Q50 90 60 85 Q70 80 80 85" stroke="white" strokeWidth="3" fill="none" />
      <path d="M15 90 Q25 87 35 90 Q45 93 55 90 Q65 87 75 90 Q85 93 95 90" stroke="white" strokeWidth="2" fill="none" />
    </svg>
  ),
  7: ( // Clean Energy - Sun with lightning bolt
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Sun rays */}
      <g stroke="white" strokeWidth="3" fill="none">
        <line x1="50" y1="10" x2="50" y2="20" />
        <line x1="50" y1="80" x2="50" y2="90" />
        <line x1="10" y1="50" x2="20" y2="50" />
        <line x1="80" y1="50" x2="90" y2="50" />
        <line x1="21.5" y1="21.5" x2="28.5" y2="28.5" />
        <line x1="71.5" y1="71.5" x2="78.5" y2="78.5" />
        <line x1="78.5" y1="21.5" x2="71.5" y2="28.5" />
        <line x1="28.5" y1="71.5" x2="21.5" y2="78.5" />
      </g>
      {/* Sun circle */}
      <circle cx="50" cy="50" r="18" fill="white" />
      {/* Lightning bolt */}
      <path d="M45 40 L55 40 L50 50 L55 50 L45 65 L50 55 L45 55 Z" fill="#FCC30B" />
    </svg>
  ),
  8: ( // Decent Work - Briefcase with growth arrow
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Briefcase */}
      <rect x="25" y="45" width="50" height="30" rx="3" fill="white" />
      <rect x="40" y="35" width="20" height="10" fill="white" />
      <rect x="42" y="37" width="16" height="6" fill="#A21942" />
      {/* Handle */}
      <rect x="47" y="50" width="6" height="4" rx="2" fill="#A21942" />
      {/* Growth arrow */}
      <path d="M30 25 L45 15 L60 20 L75 10" stroke="white" strokeWidth="4" fill="none" />
      <polygon points="70,8 75,10 77,15" fill="white" />
      {/* Bar chart elements */}
      <rect x="30" y="80" width="6" height="10" fill="white" />
      <rect x="40" y="75" width="6" height="15" fill="white" />
      <rect x="50" y="70" width="6" height="20" fill="white" />
      <rect x="60" y="65" width="6" height="25" fill="white" />
    </svg>
  ),
  9: ( // Innovation - Gear with lightbulb
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Gear outer */}
      <g fill="white">
        <circle cx="50" cy="50" r="25" />
        <rect x="47" y="20" width="6" height="10" />
        <rect x="47" y="70" width="6" height="10" />
        <rect x="20" y="47" width="10" height="6" />
        <rect x="70" y="47" width="10" height="6" />
        <rect x="29" y="29" width="8" height="8" transform="rotate(45 33 33)" />
        <rect x="63" y="63" width="8" height="8" transform="rotate(45 67 67)" />
        <rect x="63" y="29" width="8" height="8" transform="rotate(-45 67 33)" />
        <rect x="29" y="63" width="8" height="8" transform="rotate(-45 33 67)" />
      </g>
      {/* Inner circle */}
      <circle cx="50" cy="50" r="12" fill="#FD6925" />
      {/* Lightbulb in center */}
      <ellipse cx="50" cy="48" rx="6" ry="8" fill="white" />
      <rect x="47" y="54" width="6" height="3" fill="white" />
      <rect x="46" y="57" width="8" height="2" fill="white" />
    </svg>
  ),
  10: ( // Reduced Inequalities - Balanced people figures
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Equal sign background */}
      <rect x="20" y="40" width="60" height="6" fill="white" />
      <rect x="20" y="54" width="60" height="6" fill="white" />
      {/* People figures of different heights showing equality */}
      <g fill="white">
        {/* Person 1 - shorter */}
        <circle cx="25" cy="25" r="4" />
        <rect x="22" y="30" width="6" height="15" />
        <rect x="20" y="35" width="2" height="8" />
        <rect x="28" y="35" width="2" height="8" />
        <rect x="23" y="45" width="2" height="8" />
        <rect x="25" y="45" width="2" height="8" />

        {/* Person 2 - medium */}
        <circle cx="50" cy="20" r="4" />
        <rect x="47" y="25" width="6" height="18" />
        <rect x="45" y="30" width="2" height="10" />
        <rect x="53" y="30" width="2" height="10" />
        <rect x="48" y="43" width="2" height="10" />
        <rect x="50" y="43" width="2" height="10" />

        {/* Person 3 - taller */}
        <circle cx="75" cy="15" r="4" />
        <rect x="72" y="20" width="6" height="20" />
        <rect x="70" y="25" width="2" height="12" />
        <rect x="78" y="25" width="2" height="12" />
        <rect x="73" y="40" width="2" height="13" />
        <rect x="75" y="40" width="2" height="13" />
      </g>
      {/* Platform showing equality */}
      <rect x="15" y="75" width="70" height="8" fill="white" />
    </svg>
  ),
  11: ( // Sustainable Cities - Buildings with green elements
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* City skyline */}
      <g fill="white">
        <rect x="15" y="50" width="12" height="35" />
        <rect x="30" y="40" width="15" height="45" />
        <rect x="48" y="30" width="18" height="55" />
        <rect x="70" y="45" width="12" height="40" />
      </g>
      {/* Windows */}
      <g fill="#FD9D24">
        <rect x="18" y="55" width="2" height="3" />
        <rect x="22" y="55" width="2" height="3" />
        <rect x="18" y="65" width="2" height="3" />
        <rect x="22" y="65" width="2" height="3" />

        <rect x="33" y="45" width="3" height="4" />
        <rect x="38" y="45" width="3" height="4" />
        <rect x="33" y="55" width="3" height="4" />
        <rect x="38" y="55" width="3" height="4" />

        <rect x="52" y="35" width="3" height="4" />
        <rect x="58" y="35" width="3" height="4" />
        <rect x="52" y="45" width="3" height="4" />
        <rect x="58" y="45" width="3" height="4" />
        <rect x="52" y="55" width="3" height="4" />
        <rect x="58" y="55" width="3" height="4" />

        <rect x="73" y="50" width="2" height="3" />
        <rect x="77" y="50" width="2" height="3" />
        <rect x="73" y="60" width="2" height="3" />
        <rect x="77" y="60" width="2" height="3" />
      </g>
      {/* Green roof gardens */}
      <ellipse cx="21" cy="48" rx="4" ry="2" fill="#56C02B" />
      <ellipse cx="37" cy="38" rx="6" ry="2" fill="#56C02B" />
      <ellipse cx="57" cy="28" rx="7" ry="2" fill="#56C02B" />
      <ellipse cx="76" cy="43" rx="4" ry="2" fill="#56C02B" />
      {/* Ground */}
      <rect x="10" y="85" width="80" height="5" fill="white" />
    </svg>
  ),
  12: ( // Responsible Consumption - Recycling symbol with circular arrows
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Main recycling arrows in triangular formation */}
      <g fill="white" stroke="none">
        {/* Top arrow pointing right */}
        <path d="M35 25 L55 25 L50 35 L60 35 L45 50 L30 35 L40 35 Z" />

        {/* Bottom right arrow pointing down-left */}
        <path d="M65 45 L75 65 L65 60 L65 70 L50 55 L65 40 L65 50 Z" />

        {/* Bottom left arrow pointing up */}
        <path d="M45 75 L25 75 L30 65 L20 65 L35 50 L50 65 L40 65 Z" />
      </g>

      {/* Center circle with recycling symbol */}
      <circle cx="50" cy="50" r="8" fill="white" />
      <g fill="#BF8B2E" stroke="none">
        <path d="M47 45 L53 45 L51 50 L55 50 L48 57 L45 50 L49 50 Z" transform="rotate(0 50 50)" />
        <path d="M47 45 L53 45 L51 50 L55 50 L48 57 L45 50 L49 50 Z" transform="rotate(120 50 50)" />
        <path d="M47 45 L53 45 L51 50 L55 50 L48 57 L45 50 L49 50 Z" transform="rotate(240 50 50)" />
      </g>
    </svg>
  ),
  13: ( // Climate Action - Earth with rising temperature and weather symbols
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Earth globe */}
      <circle cx="50" cy="50" r="20" fill="white" />

      {/* Continents on Earth */}
      <g fill="#3F7E44">
        <path d="M35 40 Q40 35 45 40 L50 35 Q55 40 60 35 L60 45 Q55 50 50 45 Q45 50 40 45 Q35 50 35 40 Z" />
        <path d="M40 60 Q45 58 50 60 Q55 58 60 60 L60 65 Q55 67 50 65 Q45 67 40 65 Z" />
        <ellipse cx="42" cy="42" rx="2" ry="3" />
        <ellipse cx="58" cy="42" rx="2" ry="2" />
      </g>

      {/* Rising temperature arrows */}
      <g fill="#FF3A21">
        <path d="M75 60 L75 40 L80 45 L85 40 L85 60 Z" />
        <path d="M15 65 L15 45 L20 50 L25 45 L25 65 Z" />
      </g>

      {/* Weather symbols - storm clouds */}
      <g fill="white">
        <ellipse cx="30" cy="20" rx="8" ry="4" />
        <ellipse cx="25" cy="23" rx="5" ry="3" />
        <ellipse cx="35" cy="23" rx="6" ry="3" />

        <ellipse cx="70" cy="25" rx="6" ry="3" />
        <ellipse cx="75" cy="22" rx="4" ry="2" />
      </g>

      {/* Lightning bolts from storm clouds */}
      <g fill="#FCC30B">
        <path d="M28 28 L32 28 L30 35 L34 35 L26 45 L30 38 L28 38 Z" />
        <path d="M72 30 L75 30 L74 35 L77 35 L71 42 L74 37 L72 37 Z" />
      </g>

      {/* Heat waves */}
      <g fill="none" stroke="#FF3A21" strokeWidth="2">
        <path d="M15 75 Q20 70 25 75 Q30 80 35 75" />
        <path d="M65 75 Q70 70 75 75 Q80 80 85 75" />
      </g>
    </svg>
  ),
  14: ( // Life Below Water - Fish and waves
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Ocean waves */}
      <g fill="none" stroke="white" strokeWidth="3">
        <path d="M10 30 Q20 25 30 30 Q40 35 50 30 Q60 25 70 30 Q80 35 90 30" />
        <path d="M10 40 Q20 35 30 40 Q40 45 50 40 Q60 35 70 40 Q80 45 90 40" />
        <path d="M10 80 Q20 75 30 80 Q40 85 50 80 Q60 75 70 80 Q80 85 90 80" />
        <path d="M10 90 Q20 85 30 90 Q40 95 50 90 Q60 85 70 90 Q80 95 90 90" />
      </g>
      {/* Large fish */}
      <ellipse cx="40" cy="55" rx="15" ry="8" fill="white" />
      <polygon points="25,55 15,50 15,60" fill="white" /> {/* tail */}
      <circle cx="48" cy="52" r="2" fill="#0A97D9" /> {/* eye */}
      {/* Small fish */}
      <ellipse cx="65" cy="45" rx="8" ry="4" fill="white" />
      <polygon points="57,45 52,43 52,47" fill="white" /> {/* tail */}
      <circle cx="70" cy="44" r="1" fill="#0A97D9" /> {/* eye */}
      {/* Smaller fish */}
      <ellipse cx="70" cy="65" rx="6" ry="3" fill="white" />
      <polygon points="64,65 60,64 60,66" fill="white" /> {/* tail */}
      <circle cx="74" cy="64" r="0.8" fill="#0A97D9" /> {/* eye */}
      {/* Bubbles */}
      <circle cx="30" cy="25" r="2" fill="white" opacity="0.7" />
      <circle cx="35" cy="20" r="1.5" fill="white" opacity="0.7" />
      <circle cx="40" cy="15" r="1" fill="white" opacity="0.7" />
      <circle cx="75" cy="25" r="1.5" fill="white" opacity="0.7" />
      <circle cx="80" cy="20" r="1" fill="white" opacity="0.7" />
    </svg>
  ),
  15: ( // Life on Land - Tree with animals
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Tree trunk */}
      <rect x="45" y="60" width="10" height="25" fill="white" />
      {/* Tree crown */}
      <circle cx="50" cy="45" r="18" fill="white" />
      {/* Tree details */}
      <g fill="#56C02B">
        <circle cx="45" cy="40" r="6" />
        <circle cx="55" cy="40" r="6" />
        <circle cx="50" cy="50" r="7" />
        <circle cx="40" cy="50" r="5" />
        <circle cx="60" cy="50" r="5" />
      </g>
      {/* Bird */}
      <path d="M35 35 Q30 33 35 31 Q40 33 35 35" fill="white" />
      <circle cx="33" cy="33" r="1" fill="#56C02B" />
      {/* Small animal (rabbit) */}
      <ellipse cx="25" cy="75" rx="4" ry="3" fill="white" />
      <circle cx="25" cy="70" r="2.5" fill="white" />
      <ellipse cx="23" cy="68" rx="1" ry="2" fill="white" /> {/* ear */}
      <ellipse cx="27" cy="68" rx="1" ry="2" fill="white" /> {/* ear */}
      <circle cx="24" cy="70" r="0.5" fill="#56C02B" /> {/* eye */}
      {/* Another small animal */}
      <ellipse cx="75" cy="78" rx="3" ry="2" fill="white" />
      <circle cx="75" cy="74" r="2" fill="white" />
      <circle cx="76" cy="74" r="0.4" fill="#56C02B" />
      {/* Grass */}
      <g stroke="white" strokeWidth="2" fill="none">
        <path d="M15 85 Q17 80 19 85" />
        <path d="M20 85 Q22 80 24 85" />
        <path d="M80 85 Q82 80 84 85" />
        <path d="M85 85 Q87 80 89 85" />
      </g>
      {/* Ground */}
      <ellipse cx="50" cy="88" rx="40" ry="4" fill="white" opacity="0.6" />
    </svg>
  ),
  16: ( // Peace & Justice - Scales of justice with dove
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Scales base */}
      <rect x="47" y="45" width="6" height="35" fill="white" />
      <ellipse cx="50" cy="82" rx="12" ry="3" fill="white" />
      {/* Balance beam */}
      <rect x="25" y="42" width="50" height="4" fill="white" />
      {/* Left scale */}
      <path d="M30 46 L35 56 L25 56 Z" fill="none" stroke="white" strokeWidth="2" />
      <ellipse cx="30" cy="56" rx="8" ry="2" fill="white" />
      {/* Right scale */}
      <path d="M70 46 L75 56 L65 56 Z" fill="none" stroke="white" strokeWidth="2" />
      <ellipse cx="70" cy="56" rx="8" ry="2" fill="white" />
      {/* Dove of peace */}
      <ellipse cx="50" cy="25" rx="8" ry="4" fill="white" />
      <ellipse cx="45" cy="23" rx="3" ry="2" fill="white" /> {/* head */}
      <path d="M38 25 Q35 20 40 22 Q45 24 42 26" fill="white" /> {/* wing */}
      <path d="M58 27 Q63 25 60 22 Q55 20 58 25" fill="white" /> {/* wing */}
      <circle cx="43" cy="22" r="0.8" fill="#00689D" /> {/* eye */}
      {/* Olive branch */}
      <path d="M52 30 Q55 35 58 32" stroke="white" strokeWidth="2" fill="none" />
      <ellipse cx="54" cy="32" rx="1" ry="0.5" fill="white" />
      <ellipse cx="56" cy="31" rx="1" ry="0.5" fill="white" />
      <ellipse cx="58" cy="32" rx="1" ry="0.5" fill="white" />
    </svg>
  ),
  17: ( // Partnerships - Interlocking circles/hands
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      {/* Interlocking circles representing partnership */}
      <circle cx="35" cy="40" r="15" fill="none" stroke="white" strokeWidth="4" />
      <circle cx="65" cy="40" r="15" fill="none" stroke="white" strokeWidth="4" />
      <circle cx="50" cy="60" r="15" fill="none" stroke="white" strokeWidth="4" />
      {/* Center connection point */}
      <circle cx="50" cy="45" r="6" fill="white" />
      {/* Handshake in center */}
      <g fill="white">
        {/* Left hand */}
        <path d="M40 45 Q38 43 40 41 Q42 43 44 45 L46 47 Q44 49 42 47 Q40 49 38 47 Z" />
        {/* Right hand */}
        <path d="M60 45 Q62 43 60 41 Q58 43 56 45 L54 47 Q56 49 58 47 Q60 49 62 47 Z" />
      </g>
      {/* Connection lines */}
      <g stroke="white" strokeWidth="2" opacity="0.6">
        <line x1="42" y1="32" x2="58" y2="32" />
        <line x1="35" y1="52" x2="50" y2="68" />
        <line x1="65" y1="52" x2="50" y2="68" />
      </g>
      {/* Small connecting dots */}
      <circle cx="35" cy="25" r="2" fill="white" />
      <circle cx="65" cy="25" r="2" fill="white" />
      <circle cx="25" cy="50" r="2" fill="white" />
      <circle cx="75" cy="50" r="2" fill="white" />
      <circle cx="50" cy="80" r="2" fill="white" />
    </svg>
  ),
}
