export default function AnimatedGradientText({
  text,
  className = '',
  gradient = 'linear-gradient(110deg, #FFD166, #3DDCFF, #8F5CFF, #FF3B3B, #FFD166)',
  wave = true,
}) {
  return (
    <span
      className={`animatedGradientText ${className}`}
      style={{ '--animated-text-gradient': gradient }}
      aria-label={text}
    >
      {String(text).split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={wave ? 'animatedGradientChar' : undefined}
          style={{ '--char-delay': `${i * 44}ms` }}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
