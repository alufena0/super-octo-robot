import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productApi, Product } from '../services/api';
import AppLayout, { useTheme } from '../components/AppLayout';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const productSchema = z.object({
  name: z.string().min(2, 'Nome precisa ter pelo menos 2 caracteres'),
  sku: z.string().min(1, 'SKU é obrigatório'),
  price: z.coerce.number().min(0.01, 'Preço deve ser maior que zero'),
  cost: z.coerce.number().min(0, 'Custo não pode ser negativo'),
  quantity: z.coerce.number().int().min(0, 'Quantidade não pode ser negativa'),
  minStock: z.coerce
    .number()
    .int()
    .min(0, 'Estoque mínimo não pode ser negativo'),
  category: z.string().optional(),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// ---------------------------------------------------------------------------
// Inner component (needs theme context from AppLayout)
// ---------------------------------------------------------------------------

function ProductsContent() {
  const { theme } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const loadProducts = () => {
    setLoading(true);
    productApi
      .getAll()
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Falha ao conectar com o backend.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

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
    if (!window.confirm(`Excluir "${name}"?`)) return;
    productApi
      .delete(id)
      .then(() => loadProducts())
      .catch((err) =>
        alert(
          'Erro ao excluir: ' + (err.response?.data?.message ?? err.message),
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
        loadProducts();
      })
      .catch((err) =>
        alert(
          'Erro ao salvar: ' + (err.response?.data?.message ?? err.message),
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

  if (loading) return <p className={muted}>Carregando produtos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className={muted}>
          Total de produtos:{' '}
          <span className={`font-semibold ${text}`}>{products.length}</span>
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4f8cff] hover:bg-[#3a7aef] text-white text-sm font-medium cursor-pointer transition-colors"
        >
          + Novo Produto
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className={`${surface} border ${border} rounded-xl p-6`}>
          <h3 className={`text-[15px] font-semibold mb-4 ${text}`}>
            {editingId ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${muted}`}>Nome *</label>
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
                <label className={`text-xs font-medium ${muted}`}>SKU *</label>
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
                  Preço de Venda *
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
                  Custo *
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
                  Quantidade *
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
                  Estoque Mínimo *
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
                  Categoria
                </label>
                <input {...register('category')} className={inputCls(false)} />
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className={`text-xs font-medium ${muted}`}>
                  Descrição
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
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  reset();
                }}
                className={`px-5 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${border} ${muted} hover:${text}`}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {products.length === 0 ? (
        <p className={muted}>Nenhum produto cadastrado ainda.</p>
      ) : (
        <div
          className={`${surface} border ${border} rounded-xl overflow-hidden`}
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className={surface2}>
                {[
                  'ID',
                  'Nome',
                  'SKU',
                  'Preço',
                  'Qtd',
                  'Mín',
                  'Categoria',
                  'Ações',
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${muted} border-b ${border}`}
                  >
                    {h}
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
                            Estoque baixo
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
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium cursor-pointer transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <AppLayout title="Produtos" subtitle="Gestão de estoque">
      <ProductsContent />
    </AppLayout>
  );
}
