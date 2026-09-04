import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR, enUS } from 'date-fns/locale';
import { format, parse, isValid } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// DatePickerField
// ---------------------------------------------------------------------------
// Substitui o <input type="date"> nativo, que ignora o idioma escolhido no
// app (PT/EN) e usa o locale do sistema operacional/navegador. Esse
// componente é 100% controlado pelo i18next: o calendário, os nomes dos
// meses e dias sempre seguem o idioma atualmente selecionado no site,
// independente da configuração regional do usuário.
//
// v2: sem captionLayout="dropdown" (causava duplicação de selects na v10
// do react-day-picker) e sem depender do CSS oficial da lib — todo o
// estilo é aplicado via classNames + Tailwind, evitando conflito. O
// calendário é posicionado como popover fixo (position: fixed calculado
// via getBoundingClientRect), então nunca empurra o layout da página.
//
// Guarda o valor como string 'yyyy-MM-dd' (mesmo formato que o backend
// espera), igual ao input nativo — então o schema zod e o payload da API
// não mudam.
// ---------------------------------------------------------------------------

interface DatePickerFieldProps {
  value: string; // 'yyyy-MM-dd' ou ''
  onChange: (value: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  inputCls: string;
  theme: 'light' | 'dark';
  border: string;
  surface: string;
  text: string;
}

const LOCALES = {
  pt: ptBR,
  en: enUS,
} as const;

export function DatePickerField({
  value,
  onChange,
  hasError,
  inputCls,
  theme,
  border,
  surface,
  text,
}: DatePickerFieldProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const lang = i18n.language?.startsWith('pt') ? 'pt' : 'en';
  const locale = LOCALES[lang];
  const displayFormat = lang === 'pt' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';

  const selectedDate =
    value && isValid(parse(value, 'yyyy-MM-dd', new Date()))
      ? parse(value, 'yyyy-MM-dd', new Date())
      : undefined;

  const displayValue = selectedDate
    ? format(selectedDate, displayFormat, { locale })
    : '';

  // Posiciona o popover logo abaixo do botão, usando position: fixed —
  // isso garante que ele flutue sobre o resto da página em vez de
  // empurrar o layout (o problema visto no print).
  const openPicker = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((o) => !o);
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setOpen(false);
    }
  };

  // Fecha ao clicar fora (botão ou popover)
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !popoverRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const isDark = theme === 'dark';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={openPicker}
        className={`${inputCls} flex items-center justify-between gap-2 text-left cursor-pointer`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={displayValue ? '' : 'opacity-50'}>
          {displayValue || (lang === 'pt' ? 'dd/mm/aaaa' : 'mm/dd/yyyy')}
        </span>
        <CalendarDays size={16} className="shrink-0 opacity-60" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: coords.top, left: coords.left }}
          className={`z-50 ${surface} border ${border} rounded-lg shadow-xl p-3`}
        >
          <DayPicker
            mode="single"
            locale={locale}
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={selectedDate}
            showOutsideDays
            classNames={{
              months: 'flex flex-col',
              month: 'flex flex-col gap-2',
              month_caption: `flex items-center justify-center h-8 font-medium text-sm ${text}`,
              caption_label: text,
              nav: 'flex items-center justify-between absolute inset-x-0 top-0 h-8 px-1',
              button_previous: `${text} opacity-70 hover:opacity-100 p-1 rounded ${isDark ? 'hover:bg-[#2a2622]' : 'hover:bg-[#f5f1e8]'}`,
              button_next: `${text} opacity-70 hover:opacity-100 p-1 rounded ${isDark ? 'hover:bg-[#2a2622]' : 'hover:bg-[#f5f1e8]'}`,
              month_grid: 'w-full border-collapse mt-2',
              weekdays: 'flex',
              weekday: `w-8 h-8 text-[11px] font-medium text-center ${text} opacity-60`,
              week: 'flex w-full',
              day: 'w-8 h-8 text-center text-sm p-0',
              day_button: `w-8 h-8 rounded ${text} hover:bg-[#92400e22] cursor-pointer`,
              selected: '[&>button]:!bg-[#92400e] [&>button]:!text-white',
              today: `[&>button]:font-bold [&>button]:underline`,
              outside: 'opacity-30',
              disabled: 'opacity-30 cursor-not-allowed',
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left' ? (
                  <ChevronLeft size={16} />
                ) : (
                  <ChevronRight size={16} />
                ),
            }}
          />
        </div>
      )}
    </>
  );
}
