import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@erp.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const inputCls =
    'w-full px-3 py-2 mt-1 rounded-lg border border-[#d0d4e8] text-sm focus:outline-none focus:ring-1 focus:ring-[#4f8cff]';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f8] font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-[#d0d4e8] w-[360px] p-8">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f8cff] to-[#a78bfa] flex items-center justify-center text-white text-[13px] font-bold">
            ERP
          </div>
        </div>

        <h2 className="text-[18px] font-semibold text-[#1a1d27] text-center mb-6">
          MeuERP
        </h2>

        {error && (
          <p className="text-red-500 text-[13px] mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-medium text-[#5a6378]">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#5a6378]">
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputCls}
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

        <p className="text-center text-[12px] text-[#8892a4] mt-5">
          {t('auth.demo')}
        </p>
      </div>
    </div>
  );
}
