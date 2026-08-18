import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { productApi, Product } from '../services/api';
import AppLayout, { useTheme } from '../components/AppLayout';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than zero'),
  cost: z.coerce.number().min(0, 'Cost cannot be negative'),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
  minStock: z.coerce.number().int().min(0, 'Min stock cannot be negative'),
  category: z.string().optional(),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// ---------------------------------------------------------------------------
// ProductsContent
// ---------------------------------------------------------------------------

function ProductsContent() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      cost: 0,
      quantity: 0,
      minStock: 0,
      category: '',
      description: '',
    },
  });

  const loadProducts = (p = page) => {
    setLoading(true);
    productApi
      .getAll(p, limit)
      .then((res) => {
        setProducts(res.data.data);
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
    loadProducts(page);
  }, [page]);

  const openCreate = () => {
    setEditingId(null);
    reset({
      name: '',
      sku: '',
      price: 0,
      cost: 0,
      quantity: 0,
      minStock: 0,
      category: '',
      description: '',
    });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    reset({
      name: p.name,
      sku: p.sku,
      price: p.price,
      cost: p.cost,
      quantity: p.quantity,
      minStock: p.minStock,
      category: p.category ?? '',
      description: p.description ?? '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(t('common.confirmDelete', { name }))) return;
    productApi
      .delete(id)
      .then(() => loadProducts(page))
      .catch((err) =>
        alert(
          t('common.errorDelete', {
            message: err.response?.data?.message ?? err.message,
          }),
        ),
      );
  };

  const onSubmit = (data: ProductFormData) => {
    const req = editingId
      ? productApi.update(editingId, data)
      : productApi.create(data);
    req
      .then(() => {
        reset();
        setShowForm(false);
        setEditingId(null);
        loadProducts(page);
      })
      .catch((err) =>
        alert(
          t('common.errorSave', {
            message: err.response?.data?.message ?? err.message,
          }),
        ),
      );
  };

  // ---- theme shorthands ----
  const surface = theme === 'dark' ? 'bg-[#1a1d27]' : 'bg-white';
  const surface2 = theme === 'dark' ? 'bg-[#22263a]' : 'bg-[#f0f2f8]';
  const border = theme === 'dark' ? 'border-[#2a2f45]' : 'border-[#d0d4e8]';
  const text = theme === 'dark' ? 'text-[#e2e8f0]' : 'text-[#1a1d27]';
  const muted = theme === 'dark' ? 'text-[#8892a4]' : 'text-[#5a6378]';
  const accent = theme === 'dark' ? 'text-[#4f8cff]' : 'text-[#2563eb]';

  const inputCls = (hasError: boolean) =>
    `w-full px-3 py-2 rounded-lg border text-sm bg-transparent ${text} ${
      hasError
        ? 'border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
        : `${border} focus:outline-none focus:ring-1 focus:ring-[#4f8cff]`
    }`;

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className={muted}>
          Total de produtos:{' '}
          <span className={`font-semibold ${text}`}>{total}</span>
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4f8cff] hover:bg-[#3a7aef] text-white text-sm font-medium cursor-pointer transition-colors"
        >
          {t('products.newProduct')}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className={`${surface} border ${border} rounded-xl p-6`}>
          <h3 className={`text-[15px] font-semibold mb-4 ${text}`}>
            {editingId
              ? t('products.editProductTitle')
              : t('products.newProductTitle')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${muted}`}>
                  {t('products.form.name')}
                </label>
                <input
                  {...register('name')}
                  className={inputCls(!!errors.name)}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs">
                    {errors.name.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${muted}`}>
                  {t('products.form.sku')}
                </label>
                <input
                  {...register('sku')}
                  className={inputCls(!!errors.sku)}
                />
                {errors.sku && (
                  <span className="text-red-500 text-xs">
                    {errors.sku.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${muted}`}>
                  {t('products.form.salePrice')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price')}
                  className={inputCls(!!errors.price)}
                />
                {errors.price && (
                  <span className="text-red-500 text-xs">
                    {errors.price.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${muted}`}>
                  {t('products.form.cost')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('cost')}
                  className={inputCls(!!errors.cost)}
                />
                {errors.cost && (
                  <span className="text-red-500 text-xs">
                    {errors.cost.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${muted}`}>
                  {t('products.form.quantity')}
                </label>
                <input
                  type="number"
                  {...register('quantity')}
                  className={inputCls(!!errors.quantity)}
                />
                {errors.quantity && (
                  <span className="text-red-500 text-xs">
                    {errors.quantity.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${muted}`}>
                  {t('products.form.minStock')}
                </label>
                <input
                  type="number"
                  {...register('minStock')}
                  className={inputCls(!!errors.minStock)}
                />
                {errors.minStock && (
                  <span className="text-red-500 text-xs">
                    {errors.minStock.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${muted}`}>
                  {t('products.form.category')}
                </label>
                <input {...register('category')} className={inputCls(false)} />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className={`text-xs font-medium ${muted}`}>
                  {t('products.form.description')}
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className={`${inputCls(false)} resize-y`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#34d399] hover:bg-[#28c48a] text-[#0f1117] text-sm font-semibold cursor-pointer transition-colors"
              >
                {editingId ? t('common.update') : t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  reset();
                }}
                className={`px-5 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${border} ${muted}`}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className={muted}>{t('common.loading')}</p>
      ) : products.length === 0 ? (
        <p className={muted}>{t('products.noProducts')}</p>
      ) : (
        <div
          className={`${surface} border ${border} rounded-xl overflow-hidden`}
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className={surface2}>
                {(
                  [
                    'table.id',
                    'table.name',
                    'table.sku',
                    'table.price',
                    'table.qty',
                    'table.min',
                    'table.category',
                    'table.actions',
                  ] as const
                ).map((k) => (
                  <th
                    key={k}
                    className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${muted} border-b ${border}`}
                  >
                    {t(`products.${k}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.quantity < p.minStock;
                return (
                  <tr
                    key={p.id}
                    className={`border-b ${border} last:border-b-0 transition-colors ${
                      low
                        ? theme === 'dark'
                          ? 'bg-red-950/30'
                          : 'bg-red-50'
                        : theme === 'dark'
                          ? 'hover:bg-[#22263a]'
                          : 'hover:bg-[#f0f2f8]'
                    }`}
                  >
                    <td className={`px-4 py-3 ${muted} font-mono text-xs`}>
                      {p.id}
                    </td>
                    <td className={`px-4 py-3 ${text} font-medium`}>
                      <div className="flex items-center gap-2">
                        {p.name}
                        {low && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 uppercase tracking-wide">
                            {t('products.stock.badge')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs ${muted}`}>
                      {p.sku}
                    </td>
                    <td className={`px-4 py-3 ${text}`}>
                      R$ {p.price.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${low ? 'text-red-400' : accent}`}
                    >
                      {p.quantity}
                    </td>
                    <td className={`px-4 py-3 ${muted}`}>{p.minStock}</td>
                    <td className={`px-4 py-3 ${muted}`}>
                      {p.category ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1.5 rounded-lg bg-[#4f8cff22] text-[#4f8cff] hover:bg-[#4f8cff33] text-xs font-medium cursor-pointer transition-colors"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium cursor-pointer transition-colors"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-t ${border}`}
          >
            <span className={`text-xs ${muted}`}>
              {t('products.pagination.info', { page, total: totalPages })}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${border} ${muted} ${theme === 'dark' ? 'hover:bg-[#22263a]' : 'hover:bg-[#f0f2f8]'}`}
              >
                {t('products.pagination.previous')}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${border} ${muted} ${theme === 'dark' ? 'hover:bg-[#22263a]' : 'hover:bg-[#f0f2f8]'}`}
              >
                {t('products.pagination.next')}
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

export default function ProductsPage() {
  const { t } = useTranslation();
  return (
    <AppLayout title={t('products.title')} subtitle={t('products.subtitle')}>
      <ProductsContent />
    </AppLayout>
  );
}
