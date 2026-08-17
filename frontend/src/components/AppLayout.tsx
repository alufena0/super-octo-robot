import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Theme context
// ---------------------------------------------------------------------------

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  icon: string;
  path: string;
  disabled?: boolean;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    section: 'Principal',
    items: [
      { label: 'Dashboard', icon: '⬡', path: '/' },
      { label: 'Produtos', icon: '📦', path: '/products' },
    ],
  },
  {
    section: 'Gestão',
    items: [
      { label: 'Vendas', icon: '🛒', path: '/sales', disabled: true },
      { label: 'Financeiro', icon: '💰', path: '/financial', disabled: true },
      { label: 'Relatórios', icon: '📊', path: '/reports', disabled: true },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { label: 'Configurações', icon: '⚙️', path: '/settings', disabled: true },
    ],
  },
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
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('erp-theme') as Theme) ?? 'dark',
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('erp-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

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

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div
        className={`flex min-h-screen font-sans text-sm ${
          theme === 'dark'
            ? 'bg-[#0f1117] text-[#e2e8f0]'
            : 'bg-[#f0f2f8] text-[#1a1d27]'
        }`}
      >
        {/* SIDEBAR */}
        <aside
          className={`w-[220px] min-w-[220px] flex flex-col ${
            theme === 'dark'
              ? 'bg-[#1a1d27] border-r border-[#2a2f45]'
              : 'bg-white border-r border-[#d0d4e8]'
          }`}
        >
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-4 py-5 border-b ${
              theme === 'dark' ? 'border-[#2a2f45]' : 'border-[#d0d4e8]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f8cff] to-[#a78bfa] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              ERP
            </div>
            <div>
              <div
                className={`text-[15px] font-semibold ${theme === 'dark' ? 'text-[#e2e8f0]' : 'text-[#1a1d27]'}`}
              >
                MeuERP
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#8892a4]">
                Sistema
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1">
            {navGroups.map((group) => (
              <div key={group.section}>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#8892a4] px-2 pt-3 pb-1">
                  {group.section}
                </div>
                {group.items.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => !item.disabled && navigate(item.path)}
                      disabled={item.disabled}
                      className={[
                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-left transition-colors',
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'cursor-pointer',
                        active
                          ? 'bg-[#4f8cff22] text-[#4f8cff] font-medium'
                          : theme === 'dark'
                            ? 'text-[#8892a4] hover:bg-[#22263a] hover:text-[#e2e8f0]'
                            : 'text-[#5a6378] hover:bg-[#e8eaf2] hover:text-[#1a1d27]',
                      ].join(' ')}
                    >
                      <span className="w-5 text-center text-[15px]">
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div
            className={`border-t p-3 flex flex-col gap-2 ${
              theme === 'dark' ? 'border-[#2a2f45]' : 'border-[#d0d4e8]'
            }`}
          >
            <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4f8cff] to-[#a78bfa] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div
                  className={`text-[13px] font-medium truncate ${theme === 'dark' ? 'text-[#e2e8f0]' : 'text-[#1a1d27]'}`}
                >
                  {user.name ?? 'Usuário'}
                </div>
                <div className="text-[11px] text-[#8892a4] truncate">
                  {user.email ?? ''}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] border transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#2a2f45] text-[#8892a4] hover:bg-[#22263a] hover:text-[#e2e8f0]'
                  : 'border-[#d0d4e8] text-[#5a6378] hover:bg-[#e8eaf2] hover:text-[#1a1d27]'
              }`}
            >
              <span>↩</span> Sair
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header
            className={`h-14 flex items-center justify-between px-6 border-b shrink-0 ${
              theme === 'dark'
                ? 'bg-[#1a1d27] border-[#2a2f45]'
                : 'bg-white border-[#d0d4e8]'
            }`}
          >
            <div>
              <h1
                className={`text-[16px] font-semibold m-0 ${theme === 'dark' ? 'text-[#e2e8f0]' : 'text-[#1a1d27]'}`}
              >
                {title}
              </h1>
              {subtitle && (
                <div className="text-[12px] text-[#8892a4] mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
            <button
              onClick={toggle}
              className={`px-3 py-1.5 rounded-lg text-[12px] border cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'bg-[#22263a] border-[#2a2f45] text-[#e2e8f0] hover:bg-[#2a2f45]'
                  : 'bg-[#e8eaf2] border-[#d0d4e8] text-[#1a1d27] hover:bg-[#d0d4e8]'
              }`}
            >
              {theme === 'dark' ? '☀ Claro' : '☾ Escuro'}
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
