import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';
import i18n from '../i18n/index';
import { HeaderDotsPattern } from '../components/HeaderDotsPattern';

const langs = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en-US', label: 'EN' },
];

type Theme = 'dark' | 'light';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      .register(email, password, name)
      .then((res) => {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/inicio');
      })
      .catch((err) =>
        setError(err.response?.data?.message || t('auth.registerError')),
      )
      .finally(() => setLoading(false));
  };

  const isDark = theme === 'dark';
  const dotColor = isDark ? '#8ec4f8' : '#2563a8';
  const dotOpacity1 = isDark ? 0.5 : 0.1;
  const dotOpacity2 = isDark ? 0.35 : 0.06;
  const dotOpacity3 = isDark ? 0.2 : 0.04;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark ? 'bg-[#0f1720]' : 'bg-[#f4f6f8]'
      }`}
    >
      <header
        className={`relative h-16 flex items-center justify-end px-6 border-b shrink-0 overflow-hidden ${
          isDark ? 'bg-[#16212c] border-[#2a3b4d]' : 'bg-white border-[#d5dee6]'
        }`}
      >
        <HeaderDotsPattern
          color={dotColor}
          opacity1={dotOpacity1}
          opacity2={dotOpacity2}
          opacity3={dotOpacity3}
          viewBoxWidth={680}
          viewBoxHeight={56}
          startX={140}
        />

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
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded text-[12px] border cursor-pointer transition-colors ${
              isDark
                ? 'bg-[#1e2c3a] border-[#2a3b4d] text-[#e8edf2] hover:bg-[#24374a]'
                : 'bg-[#e7edf3] border-[#d5dee6] text-[#1a2733] hover:bg-[#dbe4ec]'
            }`}
          >
            {isDark ? t('theme.light') : t('theme.dark')}
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-10">
        <div
          className={`rounded shadow-sm border w-[360px] p-8 ${
            isDark
              ? 'bg-[#16212c] border-[#2a3b4d]'
              : 'bg-white border-[#d5dee6]'
          }`}
        >
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 rounded bg-[#2563a8] flex items-center justify-center text-white text-[13px] font-bold">
              TA
            </div>
          </div>

          <h2
            className={`text-[18px] font-semibold font-['Inter'] text-center mb-1 ${
              isDark ? 'text-[#e8edf2]' : 'text-[#1a2733]'
            }`}
          >
            {t('auth.createAccount')}
          </h2>
          <p
            className={`text-[12px] text-center mb-6 ${
              isDark ? 'text-[#8fa3b8]' : 'text-[#5c7080]'
            }`}
          >
            {t('auth.createAccountSubtitle')}
          </p>

          {error && (
            <p className="text-red-500 text-[13px] mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                className={`text-[12px] font-medium ${isDark ? 'text-[#8fa3b8]' : 'text-[#5c7080]'}`}
              >
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className={`w-full px-3 py-2 mt-1 rounded border text-sm focus:outline-none focus:ring-1 focus:ring-[#2563a8] ${
                  isDark
                    ? 'bg-[#1e2c3a] border-[#2a3b4d] text-[#e8edf2]'
                    : 'bg-white border-[#d5dee6] text-[#1a2733]'
                }`}
              />
            </div>
            <div>
              <label
                className={`text-[12px] font-medium ${isDark ? 'text-[#8fa3b8]' : 'text-[#5c7080]'}`}
              >
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-3 py-2 mt-1 rounded border text-sm focus:outline-none focus:ring-1 focus:ring-[#2563a8] ${
                  isDark
                    ? 'bg-[#1e2c3a] border-[#2a3b4d] text-[#e8edf2]'
                    : 'bg-white border-[#d5dee6] text-[#1a2733]'
                }`}
              />
            </div>
            <div>
              <label
                className={`text-[12px] font-medium ${isDark ? 'text-[#8fa3b8]' : 'text-[#5c7080]'}`}
              >
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                className={`w-full px-3 py-2 mt-1 rounded border text-sm focus:outline-none focus:ring-1 focus:ring-[#2563a8] ${
                  isDark
                    ? 'bg-[#1e2c3a] border-[#2a3b4d] text-[#e8edf2]'
                    : 'bg-white border-[#d5dee6] text-[#1a2733]'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-[#2563a8] hover:bg-[#1f5089] disabled:bg-[#8fa3b8] text-white text-sm font-semibold cursor-pointer transition-colors mt-1"
            >
              {loading ? '...' : t('auth.createAccount')}
            </button>
          </form>

          <p
            className={`text-center text-[12px] mt-5 ${isDark ? 'text-[#8fa3b8]' : 'text-[#5c7080]'}`}
          >
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-[#3b82c4] hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
