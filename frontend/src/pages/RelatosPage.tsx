import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { relatoApi, Relato } from '../services/api';
import AppLayout, { useTheme } from '../components/AppLayout';
import { DatePickerField } from '../components/DatePickerField';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Schema (idêntico ao anterior — mesmo contrato com a API)
// ---------------------------------------------------------------------------

const relatoSchema = z.object({
  comunidade: z.string().min(2, 'Nome da comunidade é obrigatório'),
  tipoViolacao: z.string().min(1, 'Tipo de violação é obrigatório'),
  descricao: z.string().min(5, 'Descrição é obrigatória'),
  local: z.string().min(1, 'Local é obrigatório'),
  dataOcorrido: z.string().min(1, 'Data é obrigatória'),
  status: z.string().optional(),
});

type RelatoFormData = z.infer<typeof relatoSchema>;

const STATUS_OPTIONS = ['novo', 'em_analise', 'encaminhado', 'resolvido'];

// Campos validados em cada etapa do wizard
const STEP_FIELDS: (keyof RelatoFormData)[][] = [
  ['comunidade', 'local'],
  ['tipoViolacao', 'dataOcorrido'],
  ['descricao'],
  [], // revisão — nada a validar, só confirmar
];

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const map: Record<string, string> = {
    novo: 'bg-[#3b82c422] text-[#3b82c4]',
    em_analise: 'bg-[#b4530922] text-[#b45309]',
    encaminhado: 'bg-[#2a3b4d] text-[#e8edf2]',
    resolvido: 'bg-[#15803d22] text-[#15803d]',
  };
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${map[status] ?? ''}`}
    >
      {t(`relatos.status.${status}`)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Wizard: cabeçalho de etapas
// ---------------------------------------------------------------------------
//
// `onStepClick` é opcional: quando fornecido (edição de um relato já
// existente), cada etapa já visitada ou a atual vira clicável, permitindo
// pular direto pra ela em vez de precisar clicar em "Próximo" repetidas
// vezes. Etapas futuras (ainda não alcançadas) continuam bloqueadas para
// não pular validação de campos que ainda não foram vistos.

function StepHeader({
  step,
  labels,
  onStepClick,
  maxReached,
}: {
  step: number;
  labels: string[];
  onStepClick?: (i: number) => void;
  maxReached: number;
}) {
  const { theme } = useTheme();
  const border = theme === 'dark' ? 'border-[#2a3b4d]' : 'border-[#d5dee6]';

  return (
    <div className={`flex items-stretch border-b ${border}`}>
      {labels.map((label, i) => {
        const active = i === step;
        const done = i < step;
        const clickable = !!onStepClick && i <= maxReached;
        return (
          <button
            key={label}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onStepClick?.(i)}
            className={`flex-1 flex items-center gap-2 px-4 py-3 border-b-2 text-left transition-colors ${
              active
                ? 'border-[#3b82c4]'
                : done
                  ? 'border-[#15803d]'
                  : 'border-transparent'
            } ${clickable ? 'cursor-pointer hover:bg-black/5' : 'cursor-default'}`}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold shrink-0 ${
                active
                  ? 'bg-[#3b82c4] text-white'
                  : done
                    ? 'bg-[#15803d] text-white'
                    : theme === 'dark'
                      ? 'bg-[#24374a] text-[#8fa3b8]'
                      : 'bg-[#dbe4ec] text-[#5c7080]'
              }`}
            >
              {done ? <Check size={12} strokeWidth={2.5} /> : i + 1}
            </span>
            <span
              className={`text-[12px] font-medium hidden sm:inline ${
                active
                  ? theme === 'dark'
                    ? 'text-[#e8edf2]'
                    : 'text-[#1a2733]'
                  : 'text-[#8fa3b8]'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RelatosContent
// ---------------------------------------------------------------------------

function RelatosContent() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const stepLabels = [
    t('relatos.wizard.step1'),
    t('relatos.wizard.step2'),
    t('relatos.wizard.step3'),
    t('relatos.wizard.step4'),
  ];
  const lastStep = stepLabels.length - 1;

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    control,
    formState: { errors },
  } = useForm<RelatoFormData>({
    resolver: zodResolver(relatoSchema),
    defaultValues: {
      comunidade: '',
      tipoViolacao: '',
      descricao: '',
      local: '',
      dataOcorrido: '',
      status: 'novo',
    },
  });

  const values = watch();

  const loadRelatos = (p = page) => {
    setLoading(true);
    relatoApi
      .getAll(p, limit)
      .then((res) => {
        setRelatos(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch(() => {
        setError(t('common.errorConnect'));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRelatos(page);
  }, [page]);

  const openCreate = () => {
    setEditingId(null);
    setStep(0);
    setMaxReached(0);
    reset({
      comunidade: '',
      tipoViolacao: '',
      descricao: '',
      local: '',
      dataOcorrido: '',
      status: 'novo',
    });
    setShowForm(true);
  };

  const openEdit = (r: Relato) => {
    setEditingId(r.id);
    setStep(0);
    // ao editar, todos os campos já existem e são válidos — libera
    // navegação livre entre todas as etapas desde o início, incluindo
    // ir direto pra revisão sem precisar clicar em "Próximo" 3 vezes
    setMaxReached(lastStep);
    reset({
      comunidade: r.comunidade,
      tipoViolacao: r.tipoViolacao,
      descricao: r.descricao,
      local: r.local,
      dataOcorrido: r.dataOcorrido.slice(0, 10),
      status: r.status,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setStep(0);
    setMaxReached(0);
    reset();
  };

  const handleDelete = (id: number, comunidade: string) => {
    if (!window.confirm(t('common.confirmDelete', { name: comunidade })))
      return;
    relatoApi
      .delete(id)
      .then(() => loadRelatos(page))
      .catch((err) =>
        alert(
          t('common.errorDelete', {
            message: err.response?.data?.message ?? err.message,
          }),
        ),
      );
  };

  const goToStep = (i: number) => {
    setStep(i);
    setMaxReached((m) => Math.max(m, i));
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) {
      const next = Math.min(step + 1, lastStep);
      setStep(next);
      setMaxReached((m) => Math.max(m, next));
    }
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = (data: RelatoFormData) => {
    // trava extra: só a etapa de revisão pode disparar o submit real.
    // Isso é o que evita o bug em que um clique em "Próximo" na
    // penúltima etapa era reprocessado pelo botão que, no mesmo
    // instante, já tinha virado type="submit" ao trocar de etapa —
    // fazendo o form ser enviado e o wizard fechar sozinho antes do
    // usuário conseguir ver a tela de revisão.
    if (step !== lastStep) return;

    setSubmitting(true);
    const req = editingId
      ? relatoApi.update(editingId, data)
      : relatoApi.create(
          data as Omit<Relato, 'id' | 'createdAt' | 'updatedAt'>,
        );
    req
      .then(() => {
        closeForm();
        loadRelatos(page);
      })
      .catch((err) =>
        alert(
          t('common.errorSave', {
            message: err.response?.data?.message ?? err.message,
          }),
        ),
      )
      .finally(() => setSubmitting(false));
  };

  // ---- theme shorthands ----
  const surface = theme === 'dark' ? 'bg-[#16212c]' : 'bg-white';
  const surface2 = theme === 'dark' ? 'bg-[#1e2c3a]' : 'bg-[#e7edf3]';
  const border = theme === 'dark' ? 'border-[#2a3b4d]' : 'border-[#d5dee6]';
  const text = theme === 'dark' ? 'text-[#e8edf2]' : 'text-[#1a2733]';
  const muted = theme === 'dark' ? 'text-[#8fa3b8]' : 'text-[#5c7080]';
  const rowHover =
    theme === 'dark' ? 'hover:bg-[#1e2c3a]' : 'hover:bg-[#e7edf3]';

  const inputCls = (hasError: boolean) =>
    `w-full px-3 py-2.5 rounded border text-sm bg-transparent ${text} ${
      hasError
        ? 'border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
        : `${border} focus:outline-none focus:ring-1 focus:ring-[#2563a8]`
    }`;

  const fieldLabel = (children: React.ReactNode) => (
    <label className={`text-xs font-medium ${muted}`}>{children}</label>
  );

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className={muted}>
          {t('relatos.totalLabel')}{' '}
          <span className={`font-semibold ${text}`}>{total}</span>
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#2563a8] hover:bg-[#1f5089] text-white text-sm font-medium cursor-pointer transition-colors"
        >
          {t('relatos.newRelato')}
        </button>
      </div>

      {/* Wizard */}
      {showForm && (
        <div
          className={`${surface} border ${border} rounded-lg overflow-hidden`}
        >
          <div className="px-6 pt-5">
            <h3 className={`text-[15px] font-semibold mb-1 ${text}`}>
              {editingId
                ? t('relatos.editRelatoTitle')
                : t('relatos.newRelatoTitle')}
            </h3>
            <p className={`text-[12px] mb-4 ${muted}`}>
              {t('relatos.wizard.intro')}
            </p>
          </div>

          <StepHeader
            step={step}
            labels={stepLabels}
            onStepClick={goToStep}
            maxReached={maxReached}
          />

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6">
            {/* Step 1 — identificação */}
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  {fieldLabel(t('relatos.form.comunidade'))}
                  <input
                    {...register('comunidade')}
                    autoFocus
                    className={inputCls(!!errors.comunidade)}
                    placeholder={t('relatos.wizard.comunidadePlaceholder')}
                  />
                  {errors.comunidade && (
                    <span className="text-red-500 text-xs">
                      {errors.comunidade.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {fieldLabel(t('relatos.form.local'))}
                  <input
                    {...register('local')}
                    className={inputCls(!!errors.local)}
                    placeholder={t('relatos.wizard.localPlaceholder')}
                  />
                  {errors.local && (
                    <span className="text-red-500 text-xs">
                      {errors.local.message}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 — qualificação do fato */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  {fieldLabel(t('relatos.form.tipoViolacao'))}
                  <input
                    {...register('tipoViolacao')}
                    autoFocus
                    className={inputCls(!!errors.tipoViolacao)}
                    placeholder={t('relatos.wizard.tipoPlaceholder')}
                  />
                  {errors.tipoViolacao && (
                    <span className="text-red-500 text-xs">
                      {errors.tipoViolacao.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {fieldLabel(t('relatos.form.dataOcorrido'))}
                  <Controller
                    name="dataOcorrido"
                    control={control}
                    render={({ field }) => (
                      <DatePickerField
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        hasError={!!errors.dataOcorrido}
                        inputCls={inputCls(!!errors.dataOcorrido)}
                        theme={theme}
                        border={border}
                        surface={surface}
                        text={text}
                      />
                    )}
                  />
                  {errors.dataOcorrido && (
                    <span className="text-red-500 text-xs">
                      {errors.dataOcorrido.message}
                    </span>
                  )}
                </div>
                {editingId && (
                  <div className="flex flex-col gap-1">
                    {fieldLabel(t('relatos.form.status'))}
                    <select {...register('status')} className={inputCls(false)}>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {t(`relatos.status.${s}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 — narrativa */}
            {step === 2 && (
              <div className="flex flex-col gap-1">
                {fieldLabel(t('relatos.form.descricao'))}
                <textarea
                  {...register('descricao')}
                  autoFocus
                  rows={7}
                  className={`${inputCls(!!errors.descricao)} resize-y`}
                  placeholder={t('relatos.wizard.descricaoPlaceholder')}
                />
                {errors.descricao && (
                  <span className="text-red-500 text-xs">
                    {errors.descricao.message}
                  </span>
                )}
              </div>
            )}

            {/* Step 4 — revisão */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <p className={`text-[12px] ${muted}`}>
                  {t('relatos.wizard.reviewIntro')}
                </p>
                <dl
                  className={`${surface2} rounded border ${border} divide-y ${border}`}
                >
                  {[
                    [t('relatos.form.comunidade'), values.comunidade],
                    [t('relatos.form.local'), values.local],
                    [t('relatos.form.tipoViolacao'), values.tipoViolacao],
                    [t('relatos.form.dataOcorrido'), values.dataOcorrido],
                  ].map(([label, value]) => (
                    <div key={label} className="flex px-4 py-2.5 gap-4">
                      <dt className={`text-[12px] w-40 shrink-0 ${muted}`}>
                        {label}
                      </dt>
                      <dd className={`text-[13px] ${text}`}>{value || '—'}</dd>
                    </div>
                  ))}
                  <div className="flex flex-col px-4 py-2.5 gap-1">
                    <dt className={`text-[12px] ${muted}`}>
                      {t('relatos.form.descricao')}
                    </dt>
                    <dd className={`text-[13px] whitespace-pre-wrap ${text}`}>
                      {values.descricao || '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex gap-3 mt-6 pt-5 border-t ${border}`}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded border text-sm cursor-pointer transition-colors ${border} ${muted}`}
                >
                  <ArrowLeft size={14} strokeWidth={2} />
                  {t('relatos.wizard.back')}
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={closeForm}
                className={`px-5 py-2 rounded border text-sm cursor-pointer transition-colors ${border} ${muted}`}
              >
                {t('common.cancel')}
              </button>
              {step < lastStep ? (
                <button
                  key="next"
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-5 py-2 rounded bg-[#2563a8] hover:bg-[#1f5089] text-white text-sm font-semibold cursor-pointer transition-colors"
                >
                  {t('relatos.wizard.next')}
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              ) : (
                <button
                  key="submit"
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded bg-[#15803d] hover:bg-[#12692f] text-white text-sm font-semibold cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? t('common.saving')
                    : editingId
                      ? t('common.update')
                      : t('relatos.wizard.submit')}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className={muted}>{t('common.loading')}</p>
      ) : relatos.length === 0 ? (
        <p className={muted}>{t('relatos.noRelatos')}</p>
      ) : (
        <div
          className={`${surface} border ${border} rounded-lg overflow-hidden`}
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className={surface2}>
                {(
                  [
                    'table.id',
                    'table.comunidade',
                    'table.tipoViolacao',
                    'table.local',
                    'table.data',
                    'table.status',
                    'table.actions',
                  ] as const
                ).map((k) => (
                  <th
                    key={k}
                    className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${muted} border-b ${border}`}
                  >
                    {t(`relatos.${k}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {relatos.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b ${border} last:border-b-0 transition-colors ${rowHover}`}
                >
                  <td className={`px-4 py-3 ${muted} font-mono text-xs`}>
                    {r.id}
                  </td>
                  <td className={`px-4 py-3 ${text} font-medium`}>
                    {r.comunidade}
                  </td>
                  <td className={`px-4 py-3 ${muted}`}>{r.tipoViolacao}</td>
                  <td className={`px-4 py-3 ${muted}`}>{r.local}</td>
                  <td className={`px-4 py-3 ${muted}`}>
                    {new Date(r.dataOcorrido).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className={`px-3 py-1.5 rounded border text-xs font-medium cursor-pointer transition-colors ${border} ${muted} ${rowHover}`}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id, r.comunidade)}
                        className="px-3 py-1.5 rounded border border-red-800/40 text-red-400 hover:bg-red-500/10 text-xs font-medium cursor-pointer transition-colors"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-t ${border}`}
          >
            <span className={`text-xs ${muted}`}>
              {t('relatos.pagination.info', { page, total: totalPages })}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${border} ${muted} ${rowHover}`}
              >
                <ArrowLeft size={12} strokeWidth={2} />
                {t('relatos.pagination.previous')}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${border} ${muted} ${rowHover}`}
              >
                {t('relatos.pagination.next')}
                <ArrowRight size={12} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function RelatosPage() {
  const { t } = useTranslation();
  return (
    <AppLayout title={t('relatos.title')} subtitle={t('relatos.subtitle')}>
      <RelatosContent />
    </AppLayout>
  );
}
