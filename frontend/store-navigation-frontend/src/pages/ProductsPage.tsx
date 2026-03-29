import { useEffect, useState } from 'react'
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  listCategories,
  listLocations,
  listProducts,
  updateCategory,
  updateProduct,
} from '../api/catalog'
import { useAuth } from '../auth/AuthContext'
import type { Category, Product, Location } from '../types'

const ProductsPage = () => {
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'])

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [search, setSearch] = useState('')

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [categoryEditId, setCategoryEditId] = useState('')
  const [categoryEditName, setCategoryEditName] = useState('')
  const [categoryEditDescription, setCategoryEditDescription] = useState('')
  const [categoryDeleteConfirmId, setCategoryDeleteConfirmId] = useState('')

  const [productEditId, setProductEditId] = useState('')
  const [productEditName, setProductEditName] = useState('')
  const [productEditSku, setProductEditSku] = useState('')
  const [productEditDescription, setProductEditDescription] = useState('')
  const [productEditPrice, setProductEditPrice] = useState('0')
  const [productEditCategoryId, setProductEditCategoryId] = useState('')
  const [productEditLocationId, setProductEditLocationId] = useState('')
  const [productEditImageUrl, setProductEditImageUrl] = useState('')
  const [productDeleteConfirmId, setProductDeleteConfirmId] = useState('')

  const loadData = async (query?: string) => {
    const [productsData, categoriesData, locationsData] = await Promise.all([
      listProducts(query),
      listCategories(),
      listLocations(),
    ])
    setProducts(productsData)
    setCategories(categoriesData)
    setLocations(locationsData)

    if (!categoryId && categoriesData.length > 0) setCategoryId(categoriesData[0].id)
    if (!locationId && locationsData.length > 0) setLocationId(locationsData[0].id)
  }

  useEffect(() => {
    void loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loadData(search)
  }

  const onCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await createCategory({ name: newCategoryName, description: newCategoryDescription || undefined })
    setNewCategoryName('')
    setNewCategoryDescription('')
    await loadData(search)
  }

  const onCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await createProduct({
      name,
      sku,
      description: description || undefined,
      price: Number(price),
      categoryId,
      locationId,
      imageUrl: imageUrl || undefined,
    })
    setName('')
    setSku('')
    setDescription('')
    setPrice('0')
    setImageUrl('')
    await loadData(search)
  }

  const onStartCategoryEdit = (category: Category) => {
    setCategoryEditId(category.id)
    setCategoryEditName(category.name)
    setCategoryEditDescription(category.description || '')
  }

  const onCancelCategoryEdit = () => {
    setCategoryEditId('')
    setCategoryEditName('')
    setCategoryEditDescription('')
  }

  const onSubmitCategoryEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await updateCategory(categoryEditId, {
      name: categoryEditName,
      description: categoryEditDescription || undefined,
    })
    onCancelCategoryEdit()
    await loadData(search)
  }

  const onConfirmDeleteCategory = async (id: string) => {
    await deleteCategory(id)
    setCategoryDeleteConfirmId('')
    if (categoryEditId === id) {
      onCancelCategoryEdit()
    }
    await loadData(search)
  }

  const onStartProductEdit = (product: Product) => {
    setProductEditId(product.id)
    setProductEditName(product.name)
    setProductEditSku(product.sku)
    setProductEditDescription(product.description || '')
    setProductEditPrice(String(product.price))
    setProductEditCategoryId(product.categoryId)
    setProductEditLocationId(product.locationId)
    setProductEditImageUrl(product.imageUrl || '')
  }

  const onCancelProductEdit = () => {
    setProductEditId('')
    setProductEditName('')
    setProductEditSku('')
    setProductEditDescription('')
    setProductEditPrice('0')
    setProductEditCategoryId('')
    setProductEditLocationId('')
    setProductEditImageUrl('')
  }

  const onSubmitProductEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await updateProduct(productEditId, {
      name: productEditName,
      sku: productEditSku,
      description: productEditDescription || undefined,
      price: Number(productEditPrice),
      categoryId: productEditCategoryId,
      locationId: productEditLocationId,
      imageUrl: productEditImageUrl || undefined,
    })
    onCancelProductEdit()
    await loadData(search)
  }

  const onConfirmDeleteProduct = async (id: string) => {
    await deleteProduct(id)
    setProductDeleteConfirmId('')
    if (productEditId === id) {
      onCancelProductEdit()
    }
    await loadData(search)
  }

  const categoryNameById = (id: string) => categories.find((item) => item.id === id)?.name || id
  const locationCodeById = (id: string) => locations.find((item) => item.id === id)?.code || id

  return (
    <section className="grid-section">
      <article className="card full-width">
        <h2>Бараа</h2>
        <form className="inline-form" onSubmit={onSearch}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Барааны нэрээр хайх" />
          <button type="submit">Хайх</button>
        </form>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Нэр</th>
                <th>SKU</th>
                <th>Ангилал</th>
                <th>Байршил</th>
                <th>Үнэ</th>
                {canManage && <th>Үйлдэл</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{categoryNameById(product.categoryId)}</td>
                  <td>{locationCodeById(product.locationId)}</td>
                  <td>{product.price}</td>
                  {canManage && (
                    <td>
                      {productDeleteConfirmId === product.id ? (
                        <div className="action-buttons">
                          <button type="button" onClick={() => void onConfirmDeleteProduct(product.id)}>Тийм</button>
                          <button type="button" onClick={() => setProductDeleteConfirmId('')}>Үгүй</button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button type="button" onClick={() => onStartProductEdit(product)}>Засах</button>
                          <button type="button" onClick={() => setProductDeleteConfirmId(product.id)}>Устгах</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canManage && productEditId && (
          <form className="sub-card" onSubmit={onSubmitProductEdit}>
            <h3>Бараа засах</h3>
            <label>
              Нэр
              <input value={productEditName} onChange={(e) => setProductEditName(e.target.value)} required />
            </label>
            <label>
              SKU
              <input value={productEditSku} onChange={(e) => setProductEditSku(e.target.value)} required />
            </label>
            <label>
              Үнэ
              <input
                type="number"
                step="0.01"
                value={productEditPrice}
                onChange={(e) => setProductEditPrice(e.target.value)}
                required
              />
            </label>
            <label>
              Ангилал
              <select value={productEditCategoryId} onChange={(e) => setProductEditCategoryId(e.target.value)} required>
                <option value="">Ангилал сонгох</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Байршил
              <select value={productEditLocationId} onChange={(e) => setProductEditLocationId(e.target.value)} required>
                <option value="">Байршил сонгох</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>{location.code}</option>
                ))}
              </select>
            </label>
            <label>
              Тайлбар
              <textarea value={productEditDescription} onChange={(e) => setProductEditDescription(e.target.value)} />
            </label>
            <label>
              Зургийн холбоос
              <input value={productEditImageUrl} onChange={(e) => setProductEditImageUrl(e.target.value)} />
            </label>
            <div className="action-buttons">
              <button type="submit">Хадгалах</button>
              <button type="button" onClick={onCancelProductEdit}>Цуцлах</button>
            </div>
          </form>
        )}
      </article>

      {canManage && (
        <>
          <form className="card" onSubmit={onCreateCategory}>
            <h3>Ангилал нэмэх</h3>
            <label>
              Нэр
              <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
            </label>
            <label>
              Тайлбар
              <textarea value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} />
            </label>
            <button type="submit">Ангилал үүсгэх</button>
            <hr />
            <h3>Ангиллууд</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Нэр</th>
                    <th>Тайлбар</th>
                    <th>Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.description}</td>
                      <td>
                        {categoryDeleteConfirmId === category.id ? (
                          <div className="action-buttons">
                            <button type="button" onClick={() => void onConfirmDeleteCategory(category.id)}>Тийм</button>
                            <button type="button" onClick={() => setCategoryDeleteConfirmId('')}>Үгүй</button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button type="button" onClick={() => onStartCategoryEdit(category)}>Засах</button>
                            <button type="button" onClick={() => setCategoryDeleteConfirmId(category.id)}>Устгах</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {categoryEditId && (
              <form className="sub-card" onSubmit={onSubmitCategoryEdit}>
                <h3>Ангилал засах</h3>
                <label>
                  Нэр
                  <input value={categoryEditName} onChange={(e) => setCategoryEditName(e.target.value)} required />
                </label>
                <label>
                  Тайлбар
                  <textarea
                    value={categoryEditDescription}
                    onChange={(e) => setCategoryEditDescription(e.target.value)}
                  />
                </label>
                <div className="action-buttons">
                  <button type="submit">Хадгалах</button>
                  <button type="button" onClick={onCancelCategoryEdit}>Цуцлах</button>
                </div>
              </form>
            )}
          </form>

          <form className="card" onSubmit={onCreateProduct}>
            <h3>Бараа нэмэх</h3>
            <label>
              Нэр
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              SKU
              <input value={sku} onChange={(e) => setSku(e.target.value)} required />
            </label>
            <label>
              Үнэ
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </label>
            <label>
              Ангилал
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">Ангилал сонгох</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Байршил
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
                <option value="">Байршил сонгох</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>{location.code}</option>
                ))}
              </select>
            </label>
            <label>
              Тайлбар
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label>
              Зургийн холбоос
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </label>
            <button type="submit">Бараа үүсгэх</button>
          </form>
        </>
      )}
    </section>
  )
}

export default ProductsPage





