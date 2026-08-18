import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';
import i18n from '../i18n/index';

const langs = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en-US', label: 'EN' },
];

type Theme = 'dark' | 'light';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@erp.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(
    () => localStorage.getItem('erp-lang') ?? 'pt-BR',
  );
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('erp-theme') as Theme) ?? 'dark',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    authApi
      .login(email, password)
      .then((res) => {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      })
      .catch((err) =>
        setError(err.response?.data?.message || t('auth.loginError')),
      )
      .finally(() => setLoading(false));
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark ? 'bg-[#0f1117]' : 'bg-[#f0f2f8]'
      }`}
    >
      {/* Topbar — idêntica à do AppLayout */}
      <header
        className={`h-14 flex items-center justify-end px-6 border-b shrink-0 ${
          isDark ? 'bg-[#1a1d27] border-[#2a2f45]' : 'bg-white border-[#d0d4e8]'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex rounded-lg border overflow-hidden ${
              isDark ? 'border-[#2a2f45]' : 'border-[#d0d4e8]'
            }`}
          >
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => switchLang(l.code)}
                className={`px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors ${
                  lang === l.code
                    ? 'bg-[#4f8cff] text-white'
                    : isDark
                      ? 'bg-[#22263a] text-[#8892a4] hover:text-[#e2e8f0]'
                      : 'bg-[#e8eaf2] text-[#5a6378] hover:text-[#1a1d27]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-lg text-[12px] border cursor-pointer transition-colors ${
              isDark
                ? 'bg-[#22263a] border-[#2a2f45] text-[#e2e8f0] hover:bg-[#2a2f45]'
                : 'bg-[#e8eaf2] border-[#d0d4e8] text-[#1a1d27] hover:bg-[#d0d4e8]'
            }`}
          >
            {isDark ? t('theme.light') : t('theme.dark')}
          </button>
        </div>
      </header>

      {/* Conteúdo centralizado */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className={`rounded-xl shadow-sm border w-[360px] p-8 ${
            isDark
              ? 'bg-[#1a1d27] border-[#2a2f45]'
              : 'bg-white border-[#d0d4e8]'
          }`}
        >
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f8cff] to-[#a78bfa] flex items-center justify-center text-white text-[13px] font-bold">
              ERP
            </div>
          </div>

          <h2
            className={`text-[18px] font-semibold text-center mb-6 ${
              isDark ? 'text-[#e2e8f0]' : 'text-[#1a1d27]'
            }`}
          >
            MeuERP
          </h2>

          {error && (
            <p className="text-red-500 text-[13px] mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                className={`text-[12px] font-medium ${isDark ? 'text-[#8892a4]' : 'text-[#5a6378]'}`}
              >
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-3 py-2 mt-1 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#4f8cff] ${
                  isDark
                    ? 'bg-[#22263a] border-[#2a2f45] text-[#e2e8f0]'
                    : 'bg-white border-[#d0d4e8] text-[#1a1d27]'
                }`}
              />
            </div>
            <div>
              <label
                className={`text-[12px] font-medium ${isDark ? 'text-[#8892a4]' : 'text-[#5a6378]'}`}
              >
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-3 py-2 mt-1 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#4f8cff] ${
                  isDark
                    ? 'bg-[#22263a] border-[#2a2f45] text-[#e2e8f0]'
                    : 'bg-white border-[#d0d4e8] text-[#1a1d27]'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#4f8cff] hover:bg-[#3a7aef] disabled:bg-[#8892a4] text-white text-sm font-semibold cursor-pointer transition-colors mt-1"
            >
              {loading ? '...' : t('auth.login')}
            </button>
          </form>

          <p className={`text-center text-[12px] mt-5 text-[#8892a4]`}>
            {t('auth.demo')}
          </p>
        </div>
      </div>
    </div>
  );
}
