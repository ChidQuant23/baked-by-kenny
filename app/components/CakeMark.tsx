export default function CakeMark({ size = 40, color = "#4A1A26" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <g stroke={color} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="50" cy="22" rx="7" ry="9" fill={color} stroke="none" />
        <path d="M58 22.5l1.5.5M58 27l1.5.5M61 24.5l1.5.5" stroke="#F5D6BD" strokeWidth="2" />
        <rect x="33" y="33" width="34" height="22" rx="4" />
        <path d="M38 47c3-5 5 4 8-1s5 3 8-1 5 3 8-1" strokeWidth="4" />
        <rect x="24" y="55" width="52" height="24" rx="3" />
        {[30, 38, 46, 54, 62, 70].map((x) => (
          <rect key={x} x={x} y="68" width="4" height="11" fill={color} stroke="none" />
        ))}
        <path d="M18 79h64M50 79v12M40 96c2-4 18-4 20 0" />
      </g>
    </svg>
  );
}
