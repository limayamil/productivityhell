const IMAGE_ICONS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/perks/*.png', {
      eager: true,
      query: '?url',
      import: 'default',
    })
  ).map(([path, url]) => [path.split('/').pop().replace('.png', ''), url])
);

const ICONS = {
  'deep-work-demon': (
    <>
      <path d="M12 3.5 9.3 7.2h5.4L12 3.5Z" />
      <path d="M7.1 8.6h9.8l-1.2 9.2-3.7 2.7-3.7-2.7-1.2-9.2Z" />
      <path d="M9.6 12.2h4.8" />
      <path d="M10.5 15.2h3" />
    </>
  ),
  'patron-sigil': (
    <>
      <path d="M12 3.6 19.3 8v8L12 20.4 4.7 16V8L12 3.6Z" />
      <path d="M12 7.2v9.6" />
      <path d="M7.8 9.6h8.4" />
      <path d="M8.9 15.1 12 12l3.1 3.1" />
    </>
  ),
  'unfinished-altar': (
    <>
      <path d="M6.2 18.4h11.6" />
      <path d="M8 15.6h8" />
      <path d="M9.2 15.6V9.4l2.8-3.8 2.8 3.8v6.2" />
      <path d="M10.8 11.6h2.4" />
      <path d="M17.6 5.4 15.4 8" />
    </>
  ),
  'critical-combo': (
    <>
      <path d="M12 3.8v16.4" />
      <path d="M3.8 12h16.4" />
      <path d="m6.2 6.2 11.6 11.6" />
      <path d="m17.8 6.2-11.6 11.6" />
      <path d="M12 8.4 15.6 12 12 15.6 8.4 12 12 8.4Z" />
    </>
  ),
  'hell-multiplier': (
    <>
      <path d="M5.2 16.8 10 12 5.2 7.2" />
      <path d="M18.8 7.2 14 12l4.8 4.8" />
      <path d="M10.2 18.8 13.8 5.2" />
      <path d="M7.7 4.8 12 3l4.3 1.8" />
    </>
  ),
  'burnout-tax': (
    <>
      <path d="M12 3.8c3 3.1 5 5.8 5 9a5 5 0 0 1-10 0c0-3.2 2-5.9 5-9Z" />
      <path d="M9.2 17.8 14.8 8" />
      <path d="M8.7 8.5c1.9 1.3 4 1.9 6.6 1.7" />
      <path d="M8.7 14.4c1.8.8 3.9 1.1 6.1.8" />
    </>
  ),
  'last-minute-pact': (
    <>
      <path d="M12 4.4a7.6 7.6 0 1 0 0 15.2 7.6 7.6 0 0 0 0-15.2Z" />
      <path d="M12 8.2V12l2.7 2" />
      <path d="M7.5 3.9 5.2 6.2" />
      <path d="M16.5 3.9l2.3 2.3" />
      <path d="M8 18.6 6.6 21" />
      <path d="M16 18.6l1.4 2.4" />
    </>
  ),
  'category-streak': (
    <>
      <path d="M5.8 15.5c2.3-5.6 4.6-8.3 8.4-11.1-.8 2.4-.4 4 .8 5.8 1 1.5 1.9 3 1.9 4.8a4.9 4.9 0 0 1-9.8 0" />
      <path d="M9.5 18.4c.2-2.7 1.2-4.4 3.2-6.1-.2 1.5.2 2.6 1.2 3.5.6.6.9 1.4.8 2.3" />
      <path d="M4.7 7.4h3.1" />
      <path d="M3.8 11h3.6" />
    </>
  ),
  'volatile-bounty': (
    <>
      <path d="M12 3.8 18.8 7.6v8.8L12 20.2l-6.8-3.8V7.6L12 3.8Z" />
      <path d="M8.4 9.2c.7-1.1 2-1.8 3.6-1.8 2.1 0 3.6 1.1 3.6 2.8 0 1.1-.6 1.9-1.9 2.6l-1.8 1" />
      <path d="M8.4 16.4h7.2" />
      <path d="M7.9 12.2 10.2 15" />
      <path d="M10.2 12.2 7.9 15" />
    </>
  ),
};

export default function PerkIcon({ perk, size = 24, strokeWidth = 1.8 }) {
  const imageIcon = IMAGE_ICONS[perk?.id];
  const icon = ICONS[perk?.id];

  if (imageIcon) {
    return (
      <img
        src={imageIcon}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{
          display: 'block',
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: 6,
          imageRendering: size <= 32 ? 'pixelated' : 'auto',
        }}
      />
    );
  }

  if (!icon) {
    return (
      <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, lineHeight: 1 }}>
        {perk?.icon || '?'}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </g>
    </svg>
  );
}
