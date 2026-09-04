import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { relatoApi, Relato, RelatoStats } from '../services/api';
import AppLayout, { useTheme } from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
      ? 'bg-[#16212c] border-[#2a3b4d]'
      : 'bg-white border-[#d5dee6]';
  const text = theme === 'dark' ? 'text-[#e8edf2]' : 'text-[#1a2733]';
  const muted = theme === 'dark' ? 'text-[#8fa3b8]' : 'text-[#5c7080]';
  const accent = {
    blue: { bar: 'bg-[#3b82c4]', tag: 'bg-[#3b82c422] text-[#3b82c4]' },
    green: { bar: 'bg-[#15803d]', tag: 'bg-[#15803d22] text-[#15803d]' },
    yellow: { bar: 'bg-[#b45309]', tag: 'bg-[#b4530922] text-[#b45309]' },
    red: { bar: 'bg-[#b91c1c]', tag: 'bg-[#b91c1c22] text-[#b91c1c]' },
  }[tagColor];
  return (
    <div className={`relative border rounded p-5 overflow-hidden ${surface}`}>
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
        className={`inline-block mt-3 text-[11px] font-semibold px-2.5 py-0.5 rounded ${accent.tag}`}
      >
        {tag}
      </span>
    </div>
  );
}

const STATUS_MAP: Record<string, string> = {
  novo: 'bg-[#3b82c422] text-[#3b82c4]',
  em_analise: 'bg-[#b4530922] text-[#b45309]',
  encaminhado: 'bg-[#2a3b4d] text-[#e8edf2]',
  resolvido: 'bg-[#15803d22] text-[#15803d]',
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${STATUS_MAP[status] ?? ''}`}
    >
      {t(`relatos.status.${status}`)}
    </span>
  );
}

function DashboardContent() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState<RelatoStats | null>(null);
  const [recent, setRecent] = useState<Relato[]>([]);
  const [pendentes, setPendentes] = useState<Relato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      relatoApi.getStats(),
      relatoApi.getAll(1, 5),
      relatoApi.getPendentes(),
    ])
      .then(([statsRes, relatosRes, pendentesRes]) => {
        setStats(statsRes.data);
        setRecent(relatosRes.data.data);
        setPendentes(pendentesRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError(t('common.errorConnect'));
        setLoading(false);
      });
  }, []);

  const surface =
    theme === 'dark'
      ? 'bg-[#16212c] border-[#2a3b4d]'
      : 'bg-white border-[#d5dee6]';
  const surface2 = theme === 'dark' ? 'bg-[#1e2c3a]' : 'bg-[#e7edf3]';
  const border = theme === 'dark' ? 'border-[#2a3b4d]' : 'border-[#d5dee6]';
  const text = theme === 'dark' ? 'text-[#e8edf2]' : 'text-[#1a2733]';
  const muted = theme === 'dark' ? 'text-[#8fa3b8]' : 'text-[#5c7080]';
  const rowHover =
    theme === 'dark' ? 'hover:bg-[#1e2c3a]' : 'hover:bg-[#e7edf3]';

  if (loading) return <p className={muted}>{t('common.loading')}</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label={t('dashboard.kpi.total')}
          value={String(stats.total)}
          sub={t('dashboard.kpi.tiposUnicos', { count: stats.tiposUnicos })}
          tag={t('dashboard.kpi.registered', { count: stats.total })}
          tagColor="blue"
        />
        <KpiCard
          label={t('dashboard.kpi.abertos')}
          value={String(stats.abertos)}
          sub={t('dashboard.kpi.aguardandoTriagem')}
          tag={
            stats.abertos === 0
              ? t('dashboard.kpi.allOk')
              : t('dashboard.kpi.needsAttention', { count: stats.abertos })
          }
          tagColor={stats.abertos === 0 ? 'green' : 'yellow'}
        />
        <KpiCard
          label={t('dashboard.kpi.encaminhados')}
          value={String(stats.encaminhados)}
          sub={t('dashboard.kpi.emEncaminhamento')}
          tag={t('dashboard.kpi.emEncaminhamento')}
          tagColor="blue"
        />
        <KpiCard
          label={t('dashboard.kpi.resolvidos')}
          value={String(stats.resolvidos)}
          sub={t('dashboard.kpi.casosFechados')}
          tag={t('dashboard.kpi.casosFechados')}
          tagColor="green"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className={`col-span-2 border rounded overflow-hidden ${surface}`}>
          <div
            className={`flex items-center justify-between px-5 py-4 border-b ${border}`}
          >
            <span className={`text-[14px] font-semibold ${text}`}>
              {t('dashboard.recentRelatos')}
            </span>
            <button
              onClick={() => navigate('/relatos')}
              className="flex items-center gap-1 text-[12px] text-[#3b82c4] hover:underline cursor-pointer"
            >
              {t('dashboard.viewAll')}
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className={surface2}>
                {(
                  [
                    'relatos.table.comunidade',
                    'relatos.table.tipoViolacao',
                    'relatos.table.data',
                    'relatos.table.status',
                  ] as const
                ).map((k) => (
                  <th
                    key={k}
                    className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${muted} border-b ${border}`}
                  >
                    {t(k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b ${border} last:border-b-0 transition-colors ${rowHover}`}
                >
                  <td className={`px-5 py-3 font-medium ${text}`}>
                    {r.comunidade}
                  </td>
                  <td className={`px-5 py-3 text-xs ${muted}`}>
                    {r.tipoViolacao}
                  </td>
                  <td className={`px-5 py-3 ${text}`}>
                    {new Date(r.dataOcorrido).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className={`px-5 py-8 text-center text-sm ${muted}`}
                  >
                    {t('dashboard.noRelatos')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={`border rounded overflow-hidden ${surface}`}>
          <div
            className={`flex items-center justify-between px-5 py-4 border-b ${border}`}
          >
            <span className={`text-[14px] font-semibold ${text}`}>
              {t('dashboard.alerts')}
            </span>
            <span className={`text-[12px] ${muted}`}>
              {t('dashboard.activeAlerts', { count: pendentes.length })}
            </span>
          </div>
          <div>
            {pendentes.length === 0 ? (
              <p className={`px-5 py-8 text-center text-sm ${muted}`}>
                {t('dashboard.noAlerts')}
              </p>
            ) : (
              pendentes.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  className={`flex items-start gap-3 px-5 py-3 border-b ${border} last:border-b-0 transition-colors ${rowHover}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${r.status === 'novo' ? 'bg-[#b91c1c]' : 'bg-[#b45309]'}`}
                  />
                  <div>
                    <div className={`text-[13px] font-medium ${text}`}>
                      {t('dashboard.alertPendente', {
                        comunidade: r.comunidade,
                        tipo: r.tipoViolacao,
                      })}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${muted}`}>
                      {t('dashboard.alertData', {
                        data: new Date(r.dataOcorrido).toLocaleDateString(
                          'pt-BR',
                        ),
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
