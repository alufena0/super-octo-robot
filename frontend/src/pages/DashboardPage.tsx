import { useEffect, useState } from 'react';
import { productApi, Product } from '../services/api';
import AppLayout, { useTheme } from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  tag: string;
  tagColor: 'blue' | 'green' | 'yellow' | 'red';
}

function KpiCard({ label, value, sub, tag, tagColor }: KpiCardProps) {
  const { theme } = useTheme();

  const surface =
    theme === 'dark'
      ? 'bg-[#1a1d27] border-[#2a2f45]'
      : 'bg-white border-[#d0d4e8]';
  const text = theme === 'dark' ? 'text-[#e2e8f0]' : 'text-[#1a1d27]';
  const muted = theme === 'dark' ? 'text-[#8892a4]' : 'text-[#5a6378]';

  const accent = {
    blue: { bar: 'bg-[#4f8cff]', tag: 'bg-[#4f8cff22] text-[#4f8cff]' },
    green: { bar: 'bg-[#34d399]', tag: 'bg-[#34d39922] text-[#34d399]' },
    yellow: { bar: 'bg-[#fbbf24]', tag: 'bg-[#fbbf2422] text-[#fbbf24]' },
    red: { bar: 'bg-[#f87171]', tag: 'bg-[#f8717122] text-[#f87171]' },
  }[tagColor];

  return (
    <div
      className={`relative border rounded-xl p-5 overflow-hidden ${surface}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent.bar}`} />
      <div
        className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${muted}`}
      >
        {label}
      </div>
      <div className={`text-3xl font-bold font-mono leading-none ${text}`}>
        {value}
      </div>
      <div className={`text-xs mt-1.5 ${muted}`}>{sub}</div>
      <span
        className={`inline-block mt-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${accent.tag}`}
      >
        {tag}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stock badge
// ---------------------------------------------------------------------------

function StockBadge({
  quantity,
  minStock,
}: {
  quantity: number;
  minStock: number;
}) {
  if (quantity <= 0)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f8717122] text-[#f87171]">
        ● Zerado
      </span>
    );
  if (quantity < minStock)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f8717122] text-[#f87171]">
        ● Baixo {quantity}
      </span>
    );
  if (quantity === minStock)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#fbbf2422] text-[#fbbf24]">
        ● Mín {quantity}
      </span>
    );
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#34d39922] text-[#34d399]">
      ● OK {quantity}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Dashboard content
// ---------------------------------------------------------------------------

function DashboardContent() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productApi
      .getAll()
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Falha ao conectar com o backend.');
        setLoading(false);
      });
  }, []);

  const surface =
    theme === 'dark'
      ? 'bg-[#1a1d27] border-[#2a2f45]'
      : 'bg-white border-[#d0d4e8]';
  const surface2 = theme === 'dark' ? 'bg-[#22263a]' : 'bg-[#f0f2f8]';
  const border = theme === 'dark' ? 'border-[#2a2f45]' : 'border-[#d0d4e8]';
  const text = theme === 'dark' ? 'text-[#e2e8f0]' : 'text-[#1a1d27]';
  const muted = theme === 'dark' ? 'text-[#8892a4]' : 'text-[#5a6378]';

  if (loading) return <p className={muted}>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // ---- KPI calculations ----
  const total = products.length;
  const stockValue = products.reduce((acc, p) => acc + p.cost * p.quantity, 0);
  const lowStock = products.filter((p) => p.quantity < p.minStock).length;
  const avgMargin =
    total === 0
      ? 0
      : (products.reduce(
          (acc, p) => acc + (p.price > 0 ? (p.price - p.cost) / p.price : 0),
          0,
        ) /
          total) *
        100;

  const recent = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  // ---- alerts ----
  const alerts: { color: string; title: string; sub: string }[] = [
    ...products
      .filter((p) => p.quantity <= 0)
      .map((p) => ({
        color: 'bg-[#f87171]',
        title: `${p.name} — sem estoque`,
        sub: `0 unidades`,
      })),
    ...products
      .filter((p) => p.quantity > 0 && p.quantity < p.minStock)
      .map((p) => ({
        color: 'bg-[#f87171]',
        title: `${p.name} — estoque crítico`,
        sub: `${p.quantity} unidades · mínimo: ${p.minStock}`,
      })),
    ...products
      .filter((p) => p.quantity === p.minStock)
      .map((p) => ({
        color: 'bg-[#fbbf24]',
        title: `${p.name} — no limite mínimo`,
        sub: `${p.quantity} unidades · mínimo: ${p.minStock}`,
      })),
    ...products
      .filter((p) => !p.category)
      .map((p) => ({
        color: 'bg-[#4f8cff]',
        title: `${p.name} — sem categoria`,
        sub: 'Recomendado para relatórios',
      })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI grid */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total de Produtos"
          value={String(total)}
          sub={`${new Set(products.map((p) => p.category).filter(Boolean)).size} categorias`}
          tag={`${total} cadastrados`}
          tagColor="blue"
        />
        <KpiCard
          label="Valor em Estoque"
          value={`R$${stockValue >= 1000 ? (stockValue / 1000).toFixed(1) + 'k' : stockValue.toFixed(0)}`}
          sub="preço de custo"
          tag="estoque atual"
          tagColor="green"
        />
        <KpiCard
          label="Estoque Baixo"
          value={String(lowStock)}
          sub="abaixo do mínimo"
          tag={
            lowStock === 0
              ? 'tudo ok'
              : `${lowStock} requer${lowStock > 1 ? 'em' : ''} atenção`
          }
          tagColor={lowStock === 0 ? 'green' : 'yellow'}
        />
        <KpiCard
          label="Margem Média"
          value={`${avgMargin.toFixed(0)}%`}
          sub="preço – custo / preço"
          tag={avgMargin >= 45 ? '▲ meta atingida' : `▼ meta: 45%`}
          tagColor={avgMargin >= 45 ? 'green' : 'red'}
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent products table */}
        <div
          className={`col-span-2 border rounded-xl overflow-hidden ${surface}`}
        >
          <div
            className={`flex items-center justify-between px-5 py-4 border-b ${border}`}
          >
            <span className={`text-[14px] font-semibold ${text}`}>
              Produtos recentes
            </span>
            <button
              onClick={() => navigate('/products')}
              className="text-[12px] text-[#4f8cff] hover:underline cursor-pointer"
            >
              Ver todos →
            </button>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className={surface2}>
                {['Nome', 'SKU', 'Preço', 'Estoque'].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${muted} border-b ${border}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b ${border} last:border-b-0 transition-colors ${theme === 'dark' ? 'hover:bg-[#22263a]' : 'hover:bg-[#f0f2f8]'}`}
                >
                  <td className={`px-5 py-3 font-medium ${text}`}>{p.name}</td>
                  <td className={`px-5 py-3 font-mono text-xs ${muted}`}>
                    {p.sku}
                  </td>
                  <td className={`px-5 py-3 ${text}`}>
                    R$ {p.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <StockBadge quantity={p.quantity} minStock={p.minStock} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className={`px-5 py-8 text-center text-sm ${muted}`}
                  >
                    Nenhum produto cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Alerts */}
        <div className={`border rounded-xl overflow-hidden ${surface}`}>
          <div
            className={`flex items-center justify-between px-5 py-4 border-b ${border}`}
          >
            <span className={`text-[14px] font-semibold ${text}`}>Alertas</span>
            <span className={`text-[12px] ${muted}`}>
              {alerts.length} ativo{alerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div>
            {alerts.length === 0 && (
              <p className={`px-5 py-8 text-center text-sm ${muted}`}>
                Nenhum alerta no momento.
              </p>
            )}
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-5 py-3 border-b ${border} last:border-b-0 transition-colors ${theme === 'dark' ? 'hover:bg-[#22263a]' : 'hover:bg-[#f0f2f8]'}`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color}`}
                />
                <div>
                  <div className={`text-[13px] font-medium ${text}`}>
                    {a.title}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${muted}`}>{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do sistema">
      <DashboardContent />
    </AppLayout>
  );
}
