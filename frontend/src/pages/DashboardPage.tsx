import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productApi, Product, ProductStats } from '../services/api';
import AppLayout, { useTheme } from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';

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

function StockBadge({
  quantity,
  minStock,
}: {
  quantity: number;
  minStock: number;
}) {
  const { t } = useTranslation();
  if (quantity <= 0)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f8717122] text-[#f87171]">
        {t('products.stock.zero')}
      </span>
    );
  if (quantity < minStock)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f8717122] text-[#f87171]">
        {t('products.stock.low', { qty: quantity })}
      </span>
    );
  if (quantity === minStock)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#fbbf2422] text-[#fbbf24]">
        {t('products.stock.min', { qty: quantity })}
      </span>
    );
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#34d39922] text-[#34d399]">
      {t('products.stock.ok', { qty: quantity })}
    </span>
  );
}

function DashboardContent() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState<ProductStats | null>(null);
  const [recent, setRecent] = useState<Product[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      productApi.getStats(),
      productApi.getAll(1, 5),
      productApi.getLowStock(),
    ])
      .then(([statsRes, productsRes, lowStockRes]) => {
        setStats(statsRes.data);
        setRecent(productsRes.data.data);
        setLowStockItems(lowStockRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError(t('common.errorConnect'));
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

  if (loading) return <p className={muted}>{t('common.loading')}</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return null;

  const stockValueFmt =
    stats.stockValue >= 1000
      ? `R$${(stats.stockValue / 1000).toFixed(1)}k`
      : `R$${stats.stockValue.toFixed(0)}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label={t('dashboard.kpi.totalProducts')}
          value={String(stats.total)}
          sub={t('dashboard.kpi.categories', { count: stats.categories })}
          tag={t('dashboard.kpi.registered', { count: stats.total })}
          tagColor="blue"
        />
        <KpiCard
          label={t('dashboard.kpi.stockValue')}
          value={stockValueFmt}
          sub={t('dashboard.kpi.costPrice')}
          tag={t('dashboard.kpi.currentStock')}
          tagColor="green"
        />
        <KpiCard
          label={t('dashboard.kpi.lowStock')}
          value={String(stats.lowStock)}
          sub={t('dashboard.kpi.belowMin')}
          tag={
            stats.lowStock === 0
              ? t('dashboard.kpi.allOk')
              : t('dashboard.kpi.needsAttention', { count: stats.lowStock })
          }
          tagColor={stats.lowStock === 0 ? 'green' : 'yellow'}
        />
        <KpiCard
          label={t('dashboard.kpi.avgMargin')}
          value={`${stats.avgMargin.toFixed(0)}%`}
          sub={t('dashboard.kpi.priceFormula')}
          tag={
            stats.avgMargin >= 45
              ? t('dashboard.kpi.goalReached')
              : t('dashboard.kpi.goalMissed')
          }
          tagColor={stats.avgMargin >= 45 ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div
          className={`col-span-2 border rounded-xl overflow-hidden ${surface}`}
        >
          <div
            className={`flex items-center justify-between px-5 py-4 border-b ${border}`}
          >
            <span className={`text-[14px] font-semibold ${text}`}>
              {t('dashboard.recentProducts')}
            </span>
            <button
              onClick={() => navigate('/products')}
              className="text-[12px] text-[#4f8cff] hover:underline cursor-pointer"
            >
              {t('dashboard.viewAll')}
            </button>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className={surface2}>
                {(
                  [
                    'dashboard.recentProducts',
                    'products.table.sku',
                    'products.table.price',
                    'products.table.qty',
                  ] as const
                ).map((k, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${muted} border-b ${border}`}
                  >
                    {i === 0 ? t('products.table.name') : t(k)}
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
                    {t('dashboard.noProducts')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={`border rounded-xl overflow-hidden ${surface}`}>
          <div
            className={`flex items-center justify-between px-5 py-4 border-b ${border}`}
          >
            <span className={`text-[14px] font-semibold ${text}`}>
              {t('dashboard.alerts')}
            </span>
            <span className={`text-[12px] ${muted}`}>
              {t('dashboard.activeAlerts', { count: stats.lowStock })}
            </span>
          </div>
          <div>
            {stats.lowStock === 0 ? (
              <p className={`px-5 py-8 text-center text-sm ${muted}`}>
                {t('dashboard.noAlerts')}
              </p>
            ) : (
              lowStockItems.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-start gap-3 px-5 py-3 border-b ${border} last:border-b-0 transition-colors ${theme === 'dark' ? 'hover:bg-[#22263a]' : 'hover:bg-[#f0f2f8]'}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${p.quantity <= 0 ? 'bg-[#f87171]' : 'bg-[#fbbf24]'}`}
                  />
                  <div>
                    <div className={`text-[13px] font-medium ${text}`}>
                      {t('dashboard.alertCritical', { name: p.name })}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${muted}`}>
                      {t('dashboard.alertUnits', {
                        quantity: p.quantity,
                        min: p.minStock,
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  return (
    <AppLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
      <DashboardContent />
    </AppLayout>
  );
}
