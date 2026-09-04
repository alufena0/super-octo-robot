// ---------------------------------------------------------------------------
// HeaderDotsPattern
// ---------------------------------------------------------------------------
// Padrão de fundo do header (pontos em 3 camadas de profundidade).
// IMPORTANTE: os pontos só começam a partir de `startX` — a área à
// esquerda (onde fica título/subtítulo) fica vazia de propósito, então
// não precisa de nenhuma caixa escura por cima do texto para "esconder"
// pontos colidindo com as letras.
// ---------------------------------------------------------------------------

interface HeaderDotsPatternProps {
  color: string;
  opacity1: number;
  opacity2: number;
  opacity3: number;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  /** Ponto (em unidades do viewBox) a partir do qual os pontos começam a aparecer. */
  startX?: number;
}

export function HeaderDotsPattern({
  color,
  opacity1,
  opacity2,
  opacity3,
  viewBoxWidth = 1200,
  viewBoxHeight = 56,
  startX = 260,
}: HeaderDotsPatternProps) {
  const gap = 50;
  const count = Math.ceil((viewBoxWidth - startX) / gap) + 1;

  const layer1 = Array.from({ length: count }, (_, i) => {
    const cx = startX + i * gap;
    const cy = 12 + ((i % 5) * 4.5);
    const r = 2.6 + (i % 3) * 0.3;
    return { cx, cy, r };
  });

  const layer2 = Array.from({ length: count }, (_, i) => {
    const cx = startX - 20 + i * gap;
    const cy = 36 + ((i % 5) * 3);
    const r = 2.4 + (i % 3) * 0.3;
    return { cx, cy, r };
  }).filter((p) => p.cx >= startX - 40);

  const layer3 = Array.from({ length: count }, (_, i) => {
    const cx = startX - 40 + i * gap;
    const cy = 4 + ((i % 3) * 2);
    const r = 1.8 + (i % 2) * 0.3;
    return { cx, cy, r };
  }).filter((p) => p.cx >= startX - 60);

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill={color} opacity={opacity1}>
        {layer1.map((p, i) => (
          <circle key={`l1-${i}`} cx={p.cx} cy={p.cy} r={p.r} />
        ))}
      </g>
      <g fill={color} opacity={opacity2}>
        {layer2.map((p, i) => (
          <circle key={`l2-${i}`} cx={p.cx} cy={p.cy} r={p.r} />
        ))}
      </g>
      <g fill={color} opacity={opacity3}>
        {layer3.map((p, i) => (
          <circle key={`l3-${i}`} cx={p.cx} cy={p.cy} r={p.r} />
        ))}
      </g>
    </svg>
  );
}
