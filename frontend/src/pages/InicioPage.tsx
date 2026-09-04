import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { relatoApi, Relato } from '../services/api';
import { HeaderDotsPattern } from '../components/HeaderDotsPattern';
import AccessibilityWidget from '../components/AccessibilityWidget';
import { ThemeContext } from '../components/AppLayout';
import { ClipboardList, Plus, LogOut, Sun, Moon, Loader2 } from 'lucide-react';
import i18n from '../i18n/index';

type Theme = 'dark' | 'light';

const STATUS_MAP: Record<string, string> = {
  novo: 'bg-[#3b82c422] text-[#3b82c4]',
  em_analise: 'bg-[#b4530922] text-[#b45309]',
  encaminhado: 'bg-[#2a3b4d] text-[#e8edf2]',
  resolvido: 'bg-[#15803d22] text-[#15803d]',
};

const langs = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en-US', label: 'EN' },
];

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

export default function InicioPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('erp-theme') as Theme) ?? 'dark',
  );
  const [lang, setLang] = useState(
    () => localStorage.getItem('erp-lang') ?? 'pt-BR',
  );
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') ?? '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    relatoApi
      .getMeus(1, 20)
      .then((res) => setRelatos(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('erp-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const switchLang = (code: string) => {
    setLang(code);
    localStorage.setItem('erp-lang', code);
    i18n.changeLanguage(code);
  };

  const handleLogout = () => {
    // pequeno feedback visual antes de navegar; evita a sensação de
    // "clique morto" quando não há transição de tela perceptível
    setLoggingOut(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => navigate('/login'), 150);
  };

  const isDark = theme === 'dark';
  const dotColor = isDark ? '#8ec4f8' : '#2563a8';
  const dotOpacity1 = isDark ? 0.5 : 0.1;
  const dotOpacity2 = isDark ? 0.35 : 0.06;
  const dotOpacity3 = isDark ? 0.2 : 0.04;

  const surface = isDark
    ? 'bg-[#16212c] border-[#2a3b4d]'
    : 'bg-white border-[#d5dee6]';
  const text = isDark ? 'text-[#e8edf2]' : 'text-[#1a2733]';
  const muted = isDark ? 'text-[#8fa3b8]' : 'text-[#5c7080]';
  const border = isDark ? 'border-[#2a3b4d]' : 'border-[#d5dee6]';

  return (
    <ThemeContext.Provider value={{ theme, toggle: toggleTheme }}>
      <div
        className={`min-h-screen flex flex-col font-sans transition-colors ${
          isDark ? 'bg-[#0f1720] text-[#e8edf2]' : 'bg-[#f4f6f8] text-[#1a2733]'
        }`}
      >
        {/* Header */}
        <header
          className={`relative h-16 flex items-center justify-between px-6 border-b shrink-0 overflow-hidden ${surface}`}
        >
          <HeaderDotsPattern
            color={dotColor}
            opacity1={dotOpacity1}
            opacity2={dotOpacity2}
            opacity3={dotOpacity3}
            startX={260}
          />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#2563a8] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
              TA
            </div>
            <div>
              <div
                className={`text-[16px] font-semibold font-['Inter'] ${text}`}
              >
                {t('inicio.greeting', { name: user.name ?? '' })}
              </div>
              <div className={`text-[12px] font-['Inter'] ${muted}`}>
                {t('inicio.subtitle')}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <div className={`flex rounded border overflow-hidden ${border}`}>
              {langs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLang(l.code)}
                  className={`px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors ${
                    lang === l.code
                      ? 'bg-[#2563a8] text-white'
                      : isDark
                        ? 'bg-[#1e2c3a] text-[#8fa3b8] hover:text-[#e8edf2]'
                        : 'bg-[#e7edf3] text-[#5c7080] hover:text-[#1a2733]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              title={isDark ? t('theme.light') : t('theme.dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] border cursor-pointer transition-colors ${
                isDark
                  ? 'bg-[#1e2c3a] border-[#2a3b4d] text-[#e8edf2] hover:bg-[#24374a]'
                  : 'bg-[#e7edf3] border-[#d5dee6] text-[#1a2733] hover:bg-[#dbe4ec]'
              }`}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title={t('auth.logout')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] border cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${border} ${muted} hover:${text}`}
            >
              {loggingOut ? (
                <Loader2
                  size={14}
                  strokeWidth={1.75}
                  className="animate-spin"
                />
              ) : (
                <LogOut size={14} strokeWidth={1.75} />
              )}
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col items-center px-6 py-10">
          <div className="w-full max-w-2xl flex flex-col gap-6">
            {/* Card de ação principal */}
            <div
              className={`${surface} border rounded-xl p-8 flex flex-col items-center text-center gap-3`}
            >
              <div className="w-14 h-14 rounded-full bg-[#2563a822] flex items-center justify-center">
                <Plus size={28} className="text-[#3b82c4]" strokeWidth={2} />
              </div>
              <h2
                className={`text-[18px] font-semibold font-['Inter'] ${text}`}
              >
                {t('inicio.newReportTitle')}
              </h2>
              <p className={`text-[13px] max-w-md ${muted}`}>
                {t('inicio.newReportDescription')}
              </p>
              <button
                onClick={() => navigate('/relatos')}
                className="mt-2 px-6 py-2.5 rounded bg-[#2563a8] hover:bg-[#1f5089] text-white text-sm font-semibold cursor-pointer transition-colors"
              >
                {t('relatos.newRelato')}
              </button>
            </div>

            {/* Meus relatos */}
            <div className={`${surface} border rounded-xl overflow-hidden`}>
              <div
                className={`flex items-center gap-2 px-6 py-4 border-b ${border}`}
              >
                <ClipboardList size={16} className={muted} />
                <span className={`text-[14px] font-semibold ${text}`}>
                  {t('inicio.myReports')}
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-10">
                  <Loader2 size={20} className={`animate-spin ${muted}`} />
                  <p className={`text-sm ${muted}`}>{t('common.loading')}</p>
                </div>
              ) : relatos.length === 0 ? (
                <p className={`px-6 py-8 text-center text-sm ${muted}`}>
                  {t('inicio.noReportsYet')}
                </p>
              ) : (
                <div className="flex flex-col">
                  {relatos.map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between px-6 py-3 border-b ${border} last:border-b-0`}
                    >
                      <div>
                        <div className={`text-[13px] font-medium ${text}`}>
                          {r.comunidade}
                        </div>
                        <div className={`text-[12px] ${muted}`}>
                          {r.tipoViolacao} ·{' '}
                          {new Date(r.dataOcorrido).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <AccessibilityWidget />
      </div>
    </ThemeContext.Provider>
  );
}
