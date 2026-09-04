import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/index';
import AccessibilityWidget from './AccessibilityWidget';
import { HeaderDotsPattern } from './HeaderDotsPattern';
import {
  LayoutDashboard,
  ClipboardList,
  ArrowLeftRight,
  Home,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  type LucideIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Theme context
// ---------------------------------------------------------------------------
type Theme = 'dark' | 'light';
export const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>(
  {
    theme: 'dark',
    toggle: () => {},
  },
);
export function useTheme() {
  return useContext(ThemeContext);
}

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------
interface NavItem {
  labelKey: string;
  icon: LucideIcon;
  path: string;
  disabled?: boolean;
}
interface NavGroup {
  sectionKey: string;
  items: NavItem[];
}
const navGroups: NavGroup[] = [
  {
    sectionKey: 'nav.sections.main',
    items: [
      { labelKey: 'nav.dashboard', icon: LayoutDashboard, path: '/' },
      { labelKey: 'nav.relatos', icon: ClipboardList, path: '/relatos' },
    ],
  },
  {
    sectionKey: 'nav.sections.management',
    items: [
      {
        labelKey: 'nav.encaminhamentos',
        icon: ArrowLeftRight,
        path: '/encaminhamentos',
        disabled: true,
      },
      {
        labelKey: 'nav.comunidades',
        icon: Home,
        path: '/comunidades',
        disabled: true,
      },
      {
        labelKey: 'nav.reports',
        icon: BarChart3,
        path: '/reports',
        disabled: true,
      },
    ],
  },
  {
    sectionKey: 'nav.sections.system',
    items: [
      {
        labelKey: 'nav.settings',
        icon: Settings,
        path: '/settings',
        disabled: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Lang selector
// ---------------------------------------------------------------------------
const langs = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en-US', label: 'EN' },
];

// ---------------------------------------------------------------------------
// AppLayout
// ---------------------------------------------------------------------------
interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}
export default function AppLayout({
  children,
  title,
  subtitle,
}: AppLayoutProps) {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('erp-theme') as Theme) ?? 'dark',
  );
  const [lang, setLang] = useState(
    () => localStorage.getItem('erp-lang') ?? 'pt-BR',
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('erp-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const switchLang = (code: string) => {
    setLang(code);
    localStorage.setItem('erp-lang', code);
    i18n.changeLanguage(code);
  };

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') ?? '{}');
    } catch {
      return {};
    }
  })();
  const initials =
    (user.name as string | undefined)
      ?.split(' ')
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ============================================================
  // Cores/opacidades do padrão de pontos do header.
  // Fundo do header: #16212c (muito escuro)
  // Cor dos pontos no dark: #8ec4f8 (azul bem claro)
  // ============================================================
  const isDark = theme === 'dark';
  const dotColor = isDark ? '#8ec4f8' : '#2563a8';
  const dotOpacity1 = isDark ? 0.7 : 0.1;
  const dotOpacity2 = isDark ? 0.5 : 0.06;
  const dotOpacity3 = isDark ? 0.3 : 0.04;

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div
        className={`flex min-h-screen font-sans text-sm ${
          isDark ? 'bg-[#0f1720] text-[#e8edf2]' : 'bg-[#f4f6f8] text-[#1a2733]'
        }`}
      >
        {/* SIDEBAR */}
        <aside
          className={`w-[220px] min-w-[220px] flex flex-col ${
            isDark
              ? 'bg-[#16212c] border-r border-[#2a3b4d]'
              : 'bg-white border-r border-[#d5dee6]'
          }`}
        >
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-4 py-5 border-b ${
              isDark ? 'border-[#2a3b4d]' : 'border-[#d5dee6]'
            }`}
          >
            <div className="w-8 h-8 rounded bg-[#2563a8] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              TA
            </div>
            <div>
              <div
                className={`text-[15px] font-semibold ${isDark ? 'text-[#e8edf2]' : 'text-[#1a2733]'}`}
              >
                TerreiroAcolhe
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#8fa3b8]">
                Rede de Apoio
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1">
            {navGroups.map((group) => (
              <div key={group.sectionKey}>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#8fa3b8] px-2 pt-3 pb-1">
                  {t(group.sectionKey)}
                </div>
                {group.items.map((item) => {
                  const active = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => !item.disabled && navigate(item.path)}
                      disabled={item.disabled}
                      className={[
                        'w-full flex items-center gap-2 px-3 py-2 rounded text-[13px] text-left transition-colors',
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'cursor-pointer',
                        active
                          ? 'bg-[#3b82c422] text-[#3b82c4] font-medium'
                          : isDark
                            ? 'text-[#8fa3b8] hover:bg-[#1e2c3a] hover:text-[#e8edf2]'
                            : 'text-[#5c7080] hover:bg-[#e7edf3] hover:text-[#1a2733]',
                      ].join(' ')}
                    >
                      <Icon size={16} strokeWidth={1.75} className="shrink-0" />
                      {t(item.labelKey)}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div
            className={`border-t p-3 flex flex-col gap-2 ${
              isDark ? 'border-[#2a3b4d]' : 'border-[#d5dee6]'
            }`}
          >
            <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 rounded-full bg-[#3b5166] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div
                  className={`text-[13px] font-medium truncate ${isDark ? 'text-[#e8edf2]' : 'text-[#1a2733]'}`}
                >
                  {user.name ?? 'Usuário'}
                </div>
                <div className="text-[11px] text-[#8fa3b8] truncate">
                  {user.email ?? ''}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-[12px] border transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#2a3b4d] text-[#8fa3b8] hover:bg-[#1e2c3a] hover:text-[#e8edf2]'
                  : 'border-[#d5dee6] text-[#5c7080] hover:bg-[#e7edf3] hover:text-[#1a2733]'
              }`}
            >
              <LogOut size={14} strokeWidth={1.75} />
              {t('auth.logout')}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header
            className={`relative h-14 flex items-center justify-between px-6 border-b shrink-0 overflow-hidden ${
              isDark
                ? 'bg-[#16212c] border-[#2a3b4d]'
                : 'bg-white border-[#d5dee6]'
            }`}
          >
            <HeaderDotsPattern
              color={dotColor}
              opacity1={dotOpacity1}
              opacity2={dotOpacity2}
              opacity3={dotOpacity3}
              startX={260}
            />

            {/* Título — sem caixa de fundo; a área já está livre de pontos */}
            <div className="relative z-10">
              <h1
                className={`text-[18px] font-semibold font-['Inter'] m-0 ${
                  isDark ? 'text-[#e8edf2]' : 'text-[#1a2733]'
                }`}
              >
                {title}
              </h1>
              {subtitle && (
                <div
                  className={`text-[13px] font-medium font-['Inter'] mt-0.5 ${
                    isDark ? 'text-[#b0c4d9]' : 'text-[#5c7080]'
                  }`}
                >
                  {subtitle}
                </div>
              )}
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <div
                className={`flex rounded border overflow-hidden ${
                  isDark ? 'border-[#2a3b4d]' : 'border-[#d5dee6]'
                }`}
              >
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
                onClick={toggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] border cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-[#1e2c3a] border-[#2a3b4d] text-[#e8edf2] hover:bg-[#24374a]'
                    : 'bg-[#e7edf3] border-[#d5dee6] text-[#1a2733] hover:bg-[#dbe4ec]'
                }`}
              >
                {isDark ? (
                  <Sun size={14} strokeWidth={1.75} />
                ) : (
                  <Moon size={14} strokeWidth={1.75} />
                )}
                {isDark ? t('theme.light') : t('theme.dark')}
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      <AccessibilityWidget />
    </ThemeContext.Provider>
  );
}
