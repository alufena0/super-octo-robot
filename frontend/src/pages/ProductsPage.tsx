import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productApi, Product } from '../services/api';
import { useNavigate } from 'react-router-dom';

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

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
      .catch((err) => {
        console.error(err);
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

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    reset({
      name: product.name,
      sku: product.sku,
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      minStock: product.minStock,
      category: product.category || '',
      description: product.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${name}"?`)) return;
    productApi
      .delete(id)
      .then(() => loadProducts())
      .catch((err) => {
        alert(
          'Erro ao excluir: ' + (err.response?.data?.message || err.message),
        );
      });
  };

  const onSubmit = (data: ProductFormData) => {
    const request = editingId
      ? productApi.update(editingId, data)
      : productApi.create(data);

    request
      .then(() => {
        reset();
        setShowForm(false);
        setEditingId(null);
        loadProducts();
      })
      .catch((err) => {
        alert(
          'Erro ao salvar: ' + (err.response?.data?.message || err.message),
        );
      });
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '6px',
    border: `1px solid ${hasError ? '#dc3545' : '#ccc'}`,
    borderRadius: '4px',
    boxSizing: 'border-box',
  });

  const errorStyle: React.CSSProperties = {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '2px',
  };

  if (loading) return <p>Carregando produtos...</p>;
  if (error) return <p style={{ color: 'red', padding: '2rem' }}>{error}</p>;

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1 style={{ margin: 0 }}>📦 Módulo de Estoque</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </div>
      <p>
        Total de produtos cadastrados: <strong>{products.length}</strong>
      </p>

      <button
        onClick={openCreate}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        + Novo Produto
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #dee2e6',
          }}
        >
          <h3>{editingId ? 'Editar Produto' : 'Cadastrar Produto'}</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div>
              <label>Nome *</label>
              <input {...register('name')} style={inputStyle(!!errors.name)} />
              {errors.name && (
                <span style={errorStyle}>{errors.name.message}</span>
              )}
            </div>
            <div>
              <label>SKU *</label>
              <input {...register('sku')} style={inputStyle(!!errors.sku)} />
              {errors.sku && (
                <span style={errorStyle}>{errors.sku.message}</span>
              )}
            </div>
            <div>
              <label>Preço de Venda *</label>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                style={inputStyle(!!errors.price)}
              />
              {errors.price && (
                <span style={errorStyle}>{errors.price.message}</span>
              )}
            </div>
            <div>
              <label>Custo *</label>
              <input
                type="number"
                step="0.01"
                {...register('cost')}
                style={inputStyle(!!errors.cost)}
              />
              {errors.cost && (
                <span style={errorStyle}>{errors.cost.message}</span>
              )}
            </div>
            <div>
              <label>Quantidade em Estoque *</label>
              <input
                type="number"
                {...register('quantity')}
                style={inputStyle(!!errors.quantity)}
              />
              {errors.quantity && (
                <span style={errorStyle}>{errors.quantity.message}</span>
              )}
            </div>
            <div>
              <label>Estoque Mínimo *</label>
              <input
                type="number"
                {...register('minStock')}
                style={inputStyle(!!errors.minStock)}
              />
              {errors.minStock && (
                <span style={errorStyle}>{errors.minStock.message}</span>
              )}
            </div>
            <div>
              <label>Categoria</label>
              <input {...register('category')} style={inputStyle(false)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Descrição</label>
              <textarea
                {...register('description')}
                rows={2}
                style={{ ...inputStyle(false), resize: 'vertical' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                padding: '10px 24px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {editingId ? 'Atualizar Produto' : 'Salvar Produto'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                reset();
              }}
              style={{
                padding: '10px 24px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <p style={{ color: '#888' }}>Nenhum produto cadastrado ainda.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>ID</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Nome</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>SKU</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>
                Preço
              </th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Qtd</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Min</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>
                Categoria
              </th>
              <th
                style={{
                  padding: '8px',
                  border: '1px solid #ccc',
                  width: '140px',
                }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isLowStock = p.quantity < p.minStock;
              return (
                <tr
                  key={p.id}
                  style={isLowStock ? { background: '#fff3cd' } : undefined}
                >
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {p.id}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {p.name}
                    {isLowStock && (
                      <span
                        style={{
                          marginLeft: '6px',
                          background: '#dc3545',
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      >
                        ESTOQUE BAIXO
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {p.sku}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    R$ {p.price.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      border: '1px solid #ccc',
                      color: isLowStock ? '#dc3545' : 'inherit',
                      fontWeight: isLowStock ? 'bold' : 'normal',
                    }}
                  >
                    {p.quantity}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {p.minStock}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {p.category || '-'}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    <button
                      onClick={() => openEdit(p)}
                      style={{
                        padding: '4px 10px',
                        background: '#fd7e14',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '6px',
                        fontSize: '12px',
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      style={{
                        padding: '4px 10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductsPage;
