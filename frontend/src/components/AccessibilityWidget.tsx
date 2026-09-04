import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Volume2, VolumeX, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from './AppLayout';

// ---------------------------------------------------------------------------
// AccessibilityWidget
// ---------------------------------------------------------------------------
// Botão flutuante fixo (canto inferior direito). Duas funções:
//
// 1. Tamanho de fonte: ajusta uma CSS var (--a11y-font-scale) aplicada no
//    <html>, persistida em localStorage. Não depende de nada externo.
//
// 2. Narração: usa a Web Speech API nativa do navegador
//    (window.speechSynthesis) — sem custo, sem chamada de rede, funciona
//    offline. Lê o texto visível do <main> da página atual, respeitando
//    o idioma ativo (pt-BR / en-US) via i18n.
//
// FIX: o botão estava com 56px de ícone (VLibrasIcon size=56) dentro de um
// wrapper de 14x14 (56px) — ok — mas o `bottom-6 right-6` (24px) somado ao
// próprio SVG (que tem sombra do gradiente) fazia ele encostar/sobrepor a
// paginação e outros controles no canto inferior direito em telas menores
// ou com scroll, "invadindo" o layout como no bug reportado. Reduzi o
// tamanho do botão, aumentei a margem de segurança e usei um breakpoint
// para afastar mais ainda em mobile.
// ---------------------------------------------------------------------------

const FONT_SCALES = [1, 1.15, 1.3, 1.45] as const;
const STORAGE_KEY = 'erp-a11y-font-scale';

// Ícone oficial VLibras (mãos em Libras) — símbolo de acessibilidade em
// Língua Brasileira de Sinais. Já traz fundo com gradiente azul embutido,
// então o botão que o envolve não aplica cor de fundo própria (ver uso
// abaixo) para não duplicar/conflitar com o gradiente do SVG.
function VLibrasIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
    >
      <rect width="40" height="40" fill="url(#vlibras-grad)" rx="8" />
      <path
        fill="#fdfdfd"
        fillRule="evenodd"
        d="M14.35 8a1 1 0 0 0-.38.24c-.22.21-.22.21-.17.72l.11 1.35c.3 3.62.34 4.7.21 4.78-.21.14-.33-.06-2.35-3.97-.69-1.33-.82-1.48-1.24-1.34-.68.23-.63.57.45 2.9l.26.58c0 .01.12.3.27.61.8 1.76 1.01 2.47.75 2.57-.18.07-.51-.1-.78-.42-.14-.16-.3-.36-.38-.43a19 19 0 0 1-.78-.95l-.72-.86a7 7 0 0 0-.8-.86c-.34-.13-.8.13-.8.46 0 .29.7 1.44 2.13 3.56.9 1.33 1.11 1.8 1.32 2.97q.64 3.7 1.78 4.6c.51.4.53.4 1.75.35l1.11-.04.85-1.14.93-1.23c.33-.43 1.17-1.92 1.17-2.07 0-.02-.44-.02-.97 0q-.98.05-1.43-.04c-.52-.1-1.18-.4-1.55-.7a1.55 1.55 0 0 1-.38-1.94c.27-.45.64-.65 1.41-.74.63-.08 1.3-.26 2.27-.62l.51-.19v-.82c0-.84.16-3.78.29-5.16.1-1.09.1-1.08-.17-1.34-.19-.19-.3-.24-.5-.24-.5 0-.52.07-1.02 2.57l-.54 2.8c-.12.68-.21.93-.37 1-.2.07-.39-.25-.48-.82l-.27-1.68c-.19-1.19-.56-3.4-.64-3.8-.05-.24-.36-.6-.57-.65a1 1 0 0 0-.28 0m9.37 7.25a14 14 0 0 0-2.12.8l-1.31.62c-1.49.74-3.2 1.34-3.8 1.34-.4 0-.84.18-.88.37-.04.2.4.6.82.76.38.15.48.15 1.83.11 1.22-.03 1.47-.02 1.67.07.33.16.42.43.31.93-.11.51-.74 1.77-1.25 2.5-.33.48-2.29 3.1-3.43 4.57-.4.53-.42.8-.07 1.15.45.45.39.49 2.8-1.94 2.26-2.27 2.45-2.42 2.55-2.01.07.24.08.2-.92 2.35a16 16 0 0 0-.57 1.25c-1.15 2.49-1.2 2.65-.86 3.08.12.15.2.18.47.18.18 0 .38-.04.44-.09s.4-.62.77-1.28c.63-1.15 1-1.82 1.32-2.37 1.17-2.04 1.16-2.03 1.38-2.03.13 0 .13.03.1.86-.05.76-.14 1.66-.4 3.75-.1.79-.1 1.45.02 1.6.14.19.63.24.85.1.23-.15.33-.53.6-2.12.55-3.38.7-4.02.91-4.22.14-.13.15-.13.3 0 .07.08.17.19.2.26.04.06.15.85.24 1.76.27 2.53.29 2.66.5 2.85q.35.3.7 0c.2-.17.2-.21.26-1.12.04-.52.05-1.54.03-2.28-.03-1.43.04-2.63.17-3.04l.49-1.21c.22-.52.54-1.36.7-1.87.5-1.55.47-2.8-.1-3.36a5 5 0 0 0-.8-.54 6 6 0 0 1-1.32-1c-.57-.54-.78-.68-1.04-.75a6 6 0 0 0-1.56-.03m5.5 2.06c-.04.08.02.32.12.58.23.58.28 1.1.18 1.78-.13.88-.12.98.06 1 .24.04.36-.24.45-1 .1-.85.01-1.49-.28-2.08-.2-.42-.45-.55-.54-.28m1.27.24c-.02.05.03.3.1.54.19.58.15 1.5-.08 2.2-.15.43-.15.48-.05.59.24.24.49-.1.65-.88a4 4 0 0 0-.17-2.4c-.1-.17-.4-.2-.45-.05m-19.45 6.03c-.14.15-.1.35.2.9.52.94 1.77 2.01 2.06 1.77.21-.17.13-.33-.3-.6a4 4 0 0 1-1.38-1.56c-.29-.55-.42-.67-.58-.5m-1 .45c-.11.13-.02.46.3 1.12.45.91 1.41 1.84 1.77 1.7.18-.07.14-.35-.09-.48a4 4 0 0 1-1.45-1.99q-.25-.68-.53-.35"
        clipRule="evenodd"
      />
      <defs>
        <linearGradient
          id="vlibras-grad"
          x1="42"
          x2="-9.5"
          y1="0"
          y2="43"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3690fa" />
          <stop offset="1" stopColor="#2266d2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function applyStoredFontScale() {
  const saved = Number(localStorage.getItem(STORAGE_KEY)) || 1;
  document.documentElement.style.setProperty(
    '--a11y-font-scale',
    String(saved),
  );
}

export default function AccessibilityWidget() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scaleIndex, setScaleIndex] = useState(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY)) || 1;
    const idx = FONT_SCALES.indexOf(saved as (typeof FONT_SCALES)[number]);
    return idx === -1 ? 0 : idx;
  });
  const [speaking, setSpeaking] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Guarda referência viva do utterance — no Chrome, se o objeto for
  // coletado pelo garbage collector antes de tocar, a fala é
  // silenciosamente cancelada. Manter a ref evita esse bug conhecido.
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Aplica o scale de fonte no <html> sempre que mudar
  useEffect(() => {
    const scale = FONT_SCALES[scaleIndex];
    document.documentElement.style.setProperty(
      '--a11y-font-scale',
      String(scale),
    );
    localStorage.setItem(STORAGE_KEY, String(scale));
  }, [scaleIndex]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Para a narração ao trocar de página/desmontar
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    };
  }, []);

  const increaseFont = () =>
    setScaleIndex((i) => Math.min(i + 1, FONT_SCALES.length - 1));
  const decreaseFont = () => setScaleIndex((i) => Math.max(i - 1, 0));
  const resetFont = () => setScaleIndex(0);

  const speakText = (text: string, synth: SpeechSynthesis) => {
    const lang = i18n.language?.startsWith('pt') ? 'pt-BR' : 'en-US';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;

    // Tenta escolher explicitamente uma voz compatível com o idioma.
    // Sem isso, alguns navegadores (principalmente Chrome recém-aberto)
    // usam a voz padrão do sistema e podem falhar silenciosamente se
    // ela não bater com o `lang` do utterance.
    const voices = synth.getVoices();
    const match =
      voices.find((v) => v.lang === lang) ??
      voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (match) utterance.voice = match;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    // Mantém a referência viva — no Chrome o utterance pode ser
    // coletado pelo garbage collector antes de tocar, cancelando a
    // fala silenciosamente se não houver nada segurando a referência.
    utteranceRef.current = utterance;

    synth.speak(utterance);

    // Workaround para um bug antigo do Chrome: em textos longos, o
    // motor de fala às vezes "pausa" sozinho após ~15s e nunca
    // retoma. Isso mantém a fala ativa forçando resume periódico.
    const keepAlive = setInterval(() => {
      if (!synth.speaking) {
        clearInterval(keepAlive);
        return;
      }
      synth.pause();
      synth.resume();
    }, 10000);
    utterance.onend = () => {
      clearInterval(keepAlive);
      setSpeaking(false);
    };
    utterance.onerror = () => {
      clearInterval(keepAlive);
      setSpeaking(false);
    };
  };

  const toggleNarration = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    const main = document.querySelector('main');
    const text = main?.innerText?.trim();
    if (!text) return;

    synth.cancel(); // garante que não empilha leituras anteriores
    setSpeaking(true);

    // getVoices() é assíncrono na primeira chamada em muitos
    // navegadores — se a lista ainda estiver vazia, espera o evento
    // `voiceschanged` antes de falar; senão fala direto.
    const voicesReady = synth.getVoices().length > 0;
    if (voicesReady) {
      speakText(text, synth);
    } else {
      const onVoicesChanged = () => {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        speakText(text, synth);
      };
      synth.addEventListener('voiceschanged', onVoicesChanged);
      // fallback: se o evento nunca disparar, tenta falar mesmo assim
      // após um curto atraso
      setTimeout(() => {
        if (utteranceRef.current === null) {
          synth.removeEventListener('voiceschanged', onVoicesChanged);
          speakText(text, synth);
        }
      }, 300);
    }
  };

  const isDark = theme === 'dark';
  const surface = isDark
    ? 'bg-[#16212c] border-[#2a3b4d]'
    : 'bg-white border-[#d5dee6]';
  const text = isDark ? 'text-[#e8edf2]' : 'text-[#1a2733]';
  const muted = isDark ? 'text-[#8fa3b8]' : 'text-[#5c7080]';
  const border = isDark ? 'border-[#2a3b4d]' : 'border-[#d5dee6]';
  const btnSurface = isDark
    ? 'bg-[#1e2c3a] hover:bg-[#24374a] border-[#2a3b4d]'
    : 'bg-[#e7edf3] hover:bg-[#dbe4ec] border-[#d5dee6]';

  return (
    <>
      {/* Botão flutuante — 44px (era 56px), margem 16-24px (era 24px fixo),
          respeitando safe-area em mobile para nunca sobrepor conteúdo/tabelas */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-label={t('a11y.title')}
        aria-expanded={open}
        style={{
          bottom: 'max(1rem, env(safe-area-inset-bottom, 0px) + 0.75rem)',
          right: 'max(1rem, env(safe-area-inset-right, 0px) + 0.75rem)',
        }}
        className="fixed z-40 w-11 h-11 rounded-xl shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
      >
        <VLibrasIcon size={44} />
      </button>

      {/* Painel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            bottom: 'max(4.5rem, env(safe-area-inset-bottom, 0px) + 4.25rem)',
            right: 'max(1rem, env(safe-area-inset-right, 0px) + 0.75rem)',
          }}
          className={`fixed z-40 w-72 max-w-[calc(100vw-2rem)] rounded-lg border shadow-xl p-4 flex flex-col gap-4 ${surface}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[14px] font-semibold ${text}`}>
              {t('a11y.title')}
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('common.cancel')}
              className={`p-1 rounded cursor-pointer ${muted} hover:${text}`}
            >
              <X size={16} />
            </button>
          </div>

          {/* Tamanho de fonte */}
          <div className="flex flex-col gap-2">
            <span className={`text-[12px] font-medium ${muted}`}>
              {t('a11y.fontSize')}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={decreaseFont}
                disabled={scaleIndex === 0}
                aria-label={t('a11y.decrease')}
                className={`flex items-center justify-center w-9 h-9 rounded border cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${btnSurface} ${text}`}
              >
                <Minus size={16} />
              </button>
              <span className={`flex-1 text-center text-[12px] ${muted}`}>
                {Math.round(FONT_SCALES[scaleIndex] * 100)}%
              </span>
              <button
                onClick={increaseFont}
                disabled={scaleIndex === FONT_SCALES.length - 1}
                aria-label={t('a11y.increase')}
                className={`flex items-center justify-center w-9 h-9 rounded border cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${btnSurface} ${text}`}
              >
                <Plus size={16} />
              </button>
            </div>
            {scaleIndex !== 0 && (
              <button
                onClick={resetFont}
                className={`text-[11px] self-start cursor-pointer underline ${muted}`}
              >
                {t('a11y.resetFont')}
              </button>
            )}
          </div>

          {/* Narração */}
          <div className={`flex flex-col gap-2 pt-3 border-t ${border}`}>
            <span className={`text-[12px] font-medium ${muted}`}>
              {t('a11y.narration')}
            </span>
            <button
              onClick={toggleNarration}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded border text-[13px] font-medium cursor-pointer transition-colors ${btnSurface} ${text}`}
            >
              {speaking ? (
                <>
                  <VolumeX size={16} />
                  {t('a11y.stopReading')}
                </>
              ) : (
                <>
                  <Volume2 size={16} />
                  {t('a11y.readPage')}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
