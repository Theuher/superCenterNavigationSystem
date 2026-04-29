import { useEffect, useMemo, useState } from 'react'
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  listCategories,
  listFloorPlans,
  listLocations,
  listProducts,
  updateCategory,
  updateProduct,
} from '../api/catalog'
import { uploadProductImage } from '../api/cloudinary'
import { useAuth } from '../auth/AuthContext'
import FloorPlanCanvas from '../components/FloorPlanCanvas'
import type { Category, FloorPlan, Location, Product } from '../types'

const ProductsPage = () => {
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'])

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
  const [loadError, setLoadError] = useState('')
  const [accessNote, setAccessNote] = useState('')

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [floorPlanId, setFloorPlanId] = useState('')
  const [mapX, setMapX] = useState('')
  const [mapY, setMapY] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

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
  const [productEditFloorPlanId, setProductEditFloorPlanId] = useState('')
  const [productEditMapX, setProductEditMapX] = useState('')
  const [productEditMapY, setProductEditMapY] = useState('')
  const [productEditImageUrl, setProductEditImageUrl] = useState('')
  const [productEditImageFile, setProductEditImageFile] = useState<File | null>(null)
  const [productDeleteConfirmId, setProductDeleteConfirmId] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)

  const loadData = async (query?: string) => {
    setLoadError('')
    setAccessNote('')

    const [productsResult, categoriesResult, locationsResult, floorPlansResult] = await Promise.allSettled([
      listProducts(query),
      listCategories(),
      listLocations(),
      listFloorPlans(),
    ])

    if (productsResult.status === 'fulfilled') {
      setProducts(productsResult.value)
    } else {
      setProducts([])
      setLoadError('Барааны мэдээлэл ачаалж чадсангүй. Серверийн хандалтын эрхийг шалгана уу.')
    }

    if (locationsResult.status === 'fulfilled') {
      setLocations(locationsResult.value)
    } else {
      setLocations([])
      setLoadError('Байршлын мэдээлэл ачаалж чадсангүй. Серверийн хандалтын эрхийг шалгана уу.')
    }

    if (floorPlansResult.status === 'fulfilled') {
      setFloorPlans(floorPlansResult.value)
      if (!floorPlanId && floorPlansResult.value.length > 0) {
        setFloorPlanId(floorPlansResult.value[0].id)
      }
    } else {
      setFloorPlans([])
      setLoadError('План зургийн мэдээлэл ачаалж чадсангүй. Серверийн хандалтын эрхийг шалгана уу.')
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories(categoriesResult.value)
      if (!categoryId && categoriesResult.value.length > 0) {
        setCategoryId(categoriesResult.value[0].id)
      }
    } else {
      setCategories([])
      setAccessNote('Ангиллын мэдээлэлд зочин хандалт хаалттай тул зарим шүүлтүүр хязгаарлагдана.')
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const categoryNameById = (id: string) => categories.find((item) => item.id === id)?.name || id
  const locationCodeById = (id?: string) => {
    if (!id) return '-'
    return locations.find((item) => item.id === id)?.code || id
  }
  const floorPlanNameById = (id?: string) => {
    if (!id) return '-'
    return floorPlans.find((item) => item.id === id)?.name || id
  }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const byCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
        const byLocation = selectedLocation === 'all' || product.locationId === selectedLocation
        return byCategory && byLocation
      }),
    [products, selectedCategory, selectedLocation],
  )

  const formatPrice = (value: number) => `₮${value.toLocaleString()}`
  const resolvePlacement = (product: Product | null) => {
    if (!product) return null

    if (typeof product.mapX === 'number' && typeof product.mapY === 'number') {
      const resolvedFloorPlanId = product.floorPlanId
        || locations.find((location) => location.id === product.locationId)?.floorPlanId
      if (!resolvedFloorPlanId) return null

      return {
        floorPlanId: resolvedFloorPlanId,
        mapX: product.mapX,
        mapY: product.mapY,
      }
    }

    if (!product.locationId) return null
    const fallbackLocation = locations.find((location) => location.id === product.locationId)
    if (!fallbackLocation) return null

    return {
      floorPlanId: fallbackLocation.floorPlanId,
      mapX: fallbackLocation.mapX,
      mapY: fallbackLocation.mapY,
    }
  }

  const selectedFloorPlan = floorPlans.find((item) => item.id === floorPlanId) || null
  const selectedEditFloorPlan = floorPlans.find((item) => item.id === productEditFloorPlanId) || null
  const detailLocation = detailProduct && detailProduct.locationId
    ? locations.find((location) => location.id === detailProduct.locationId) || null
    : null
  const detailPlacement = resolvePlacement(detailProduct)
  const detailFloorPlan = detailPlacement
    ? floorPlans.find((plan) => plan.id === detailPlacement.floorPlanId) || null
    : null

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
    setUploadError('')

    let uploadedImageUrl = imageUrl || undefined
    if (imageFile) {
      try {
        setUploadingImage(true)
        uploadedImageUrl = await uploadProductImage(imageFile)
      } catch {
        setUploadError('Зураг Cloudinary руу upload хийхэд алдаа гарлаа.')
        return
      } finally {
        setUploadingImage(false)
      }
    }

    await createProduct({
      name,
      sku,
      description: description || undefined,
      price: Number(price),
      categoryId,
      floorPlanId: floorPlanId || undefined,
      mapX: mapX ? Number(mapX) : undefined,
      mapY: mapY ? Number(mapY) : undefined,
      imageUrl: uploadedImageUrl,
    })
    setName('')
    setSku('')
    setDescription('')
    setPrice('0')
    setMapX('')
    setMapY('')
    setImageUrl('')
    setImageFile(null)
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
    const placement = resolvePlacement(product)
    setProductEditFloorPlanId(placement?.floorPlanId || '')
    setProductEditMapX(placement ? String(placement.mapX) : '')
    setProductEditMapY(placement ? String(placement.mapY) : '')
    setProductEditImageUrl(product.imageUrl || '')
    setProductEditImageFile(null)
  }

  const onCancelProductEdit = () => {
    setProductEditId('')
    setProductEditName('')
    setProductEditSku('')
    setProductEditDescription('')
    setProductEditPrice('0')
    setProductEditCategoryId('')
    setProductEditFloorPlanId('')
    setProductEditMapX('')
    setProductEditMapY('')
    setProductEditImageUrl('')
    setProductEditImageFile(null)
  }

  const onSubmitProductEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUploadError('')

    let uploadedImageUrl = productEditImageUrl || undefined
    if (productEditImageFile) {
      try {
        setUploadingImage(true)
        uploadedImageUrl = await uploadProductImage(productEditImageFile)
      } catch {
        setUploadError('Зураг Cloudinary руу upload хийхэд алдаа гарлаа.')
        return
      } finally {
        setUploadingImage(false)
      }
    }

    await updateProduct(productEditId, {
      name: productEditName,
      sku: productEditSku,
      description: productEditDescription || undefined,
      price: Number(productEditPrice),
      categoryId: productEditCategoryId,
      floorPlanId: productEditFloorPlanId || undefined,
      mapX: productEditMapX ? Number(productEditMapX) : undefined,
      mapY: productEditMapY ? Number(productEditMapY) : undefined,
      imageUrl: uploadedImageUrl,
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

  return (
    <section className="dashboard-grid">
      <article className="panel span-12">
        <h3>Ерөнхий төлөв</h3>
        <div className="kpi-grid">
          <div className="kpi-card">
            <p className="kpi-label">Нийт бараа</p>
            <p className="kpi-value">{products.length}</p>
            <p className="kpi-sub">Идэвхтэй жагсаалт</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Ангилал</p>
            <p className="kpi-value">{categories.length}</p>
            <p className="kpi-sub">Каталог бүтэц</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Байршил</p>
            <p className="kpi-value">{locations.length}</p>
            <p className="kpi-sub">План зурагтай цэг</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Шүүлтүүрийн дүн</p>
            <p className="kpi-value">{filteredProducts.length}</p>
            <p className="kpi-sub">Одоогийн харагдац</p>
          </div>
        </div>
      </article>

      <article className="panel span-12">
        <h3>Барааны удирдлага</h3>
        {loadError && <p className="error">{loadError}</p>}
        {accessNote && <p className="muted">{accessNote}</p>}
        {uploadError && <p className="error">{uploadError}</p>}
        {uploadingImage && <p className="muted">Зураг Cloudinary руу upload хийж байна...</p>}
        <form className="filter-row" onSubmit={onSearch}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Барааны нэр, кодоор хайх" />
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="all">Бүх ангилал</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)}>
            <option value="all">Бүх байршил</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.code}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Хайх
          </button>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Бараа</th>
                <th>SKU</th>
                <th>Ангилал</th>
                <th>Байршил</th>
                <th>Үнэ</th>
                {/*<th>Төлөв</th>*/}
                {canManage && <th>Үйлдэл</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td data-label="Бараа">
                    <div className="product-name-cell">
                      <button type="button" className="product-link-btn" onClick={() => setDetailProduct(product)}>
                        {product.imageUrl ? (
                          <img className="product-thumb" src={product.imageUrl} alt={product.name} loading="lazy" />
                        ) : (
                          <div className="product-icon">📦</div>
                        )}
                        <span>{product.name}</span>
                      </button>
                    </div>
                  </td>
                  <td data-label="SKU">{product.sku}</td>
                  <td data-label="Ангилал">{categoryNameById(product.categoryId)}</td>
                  <td data-label="Байршил">
                    {product.locationId
                      ? locationCodeById(product.locationId)
                      : `${floorPlanNameById(product.floorPlanId)} (${product.mapX ?? '-'}, ${product.mapY ?? '-'})`}
                  </td>
                  <td data-label="Үнэ">{formatPrice(product.price)}</td>
                  {/*<td data-label="Төлөв">*/}
                  {/*  <span className="badge badge-ok">Байгаа</span>*/}
                  {/*</td>*/}
                  {canManage && (
                    <td data-label="Үйлдэл">
                      {productDeleteConfirmId === product.id ? (
                        <div className="action-buttons">
                          <button type="button" className="btn btn-danger" onClick={() => void onConfirmDeleteProduct(product.id)}>
                            Батлах
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => setProductDeleteConfirmId('')}>
                            Цуцлах
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button type="button" className="btn btn-secondary" onClick={() => onStartProductEdit(product)}>
                            Засах
                          </button>
                          <button type="button" className="btn btn-danger" onClick={() => setProductDeleteConfirmId(product.id)}>
                            Устгах
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {canManage && (
        <>
          <article className="panel span-6">
            <h3>Шинэ бараа нэмэх</h3>
            <form className="form-grid" onSubmit={onCreateProduct}>
              <label>
                Нэр
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label>
                SKU
                <input value={sku} onChange={(event) => setSku(event.target.value)} required />
              </label>
              <label>
                Үнэ
                <input type="number" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
              </label>
              <label>
                Ангилал
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
                  <option value="">Ангилал сонгох</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                План зураг
                <select value={floorPlanId} onChange={(event) => setFloorPlanId(event.target.value)} required>
                  <option value="">План зураг сонгох</option>
                  {floorPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.floor}-р давхар)
                    </option>
                  ))}
                </select>
              </label>
              <label>
                X координат
                <input type="number" step="0.01" value={mapX} onChange={(event) => setMapX(event.target.value)} required />
              </label>
              <label>
                Y координат
                <input type="number" step="0.01" value={mapY} onChange={(event) => setMapY(event.target.value)} required />
              </label>
              <div className="full">
                <p className="muted">План зураг дээр дарж координат автоматаар сонгоно.</p>
                <FloorPlanCanvas
                  imageUrl={selectedFloorPlan?.imageUrl}
                  marker={mapX && mapY ? { x: Number(mapX), y: Number(mapY) } : null}
                  onMarkerChange={(point) => {
                    setMapX(String(point.x))
                    setMapY(String(point.y))
                  }}
                  emptyMessage="План зураг сонгоно уу."
                />
              </div>
              <label>
                Зураг оруулах
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                />
              </label>
              <label>
                Зургийн холбоос (сонголттой)
                <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
              </label>
              <label className="full">
                Тайлбар
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
              </label>
              <button type="submit" className="btn btn-primary full">
                {uploadingImage ? 'Upload хийж байна...' : 'Бараа нэмэх'}
              </button>
            </form>

            {productEditId && (
              <form className="sub-card" onSubmit={onSubmitProductEdit}>
                <h4>Бараа засах</h4>
                <label>
                  Нэр
                  <input value={productEditName} onChange={(event) => setProductEditName(event.target.value)} required />
                </label>
                <label>
                  SKU
                  <input value={productEditSku} onChange={(event) => setProductEditSku(event.target.value)} required />
                </label>
                <label>
                  Үнэ
                  <input
                    type="number"
                    step="0.01"
                    value={productEditPrice}
                    onChange={(event) => setProductEditPrice(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Ангилал
                  <select
                    value={productEditCategoryId}
                    onChange={(event) => setProductEditCategoryId(event.target.value)}
                    required
                  >
                    <option value="">Ангилал сонгох</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  План зураг
                  <select
                    value={productEditFloorPlanId}
                    onChange={(event) => setProductEditFloorPlanId(event.target.value)}
                    required
                  >
                    <option value="">План зураг сонгох</option>
                    {floorPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} ({plan.floor}-р давхар)
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  X координат
                  <input
                    type="number"
                    step="0.01"
                    value={productEditMapX}
                    onChange={(event) => setProductEditMapX(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Y координат
                  <input
                    type="number"
                    step="0.01"
                    value={productEditMapY}
                    onChange={(event) => setProductEditMapY(event.target.value)}
                    required
                  />
                </label>
                <div className="full">
                  <p className="muted">План зураг дээр дарж координат засварлана.</p>
                  <FloorPlanCanvas
                    imageUrl={selectedEditFloorPlan?.imageUrl}
                    marker={
                      productEditMapX && productEditMapY
                        ? { x: Number(productEditMapX), y: Number(productEditMapY) }
                        : null
                    }
                    onMarkerChange={(point) => {
                      setProductEditMapX(String(point.x))
                      setProductEditMapY(String(point.y))
                    }}
                    emptyMessage="План зураг сонгоно уу."
                  />
                </div>
                <label>
                  Зураг шинэчлэх
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setProductEditImageFile(event.target.files?.[0] || null)}
                  />
                </label>
                <label>
                  Зургийн холбоос (эсвэл өмнөх URL)
                  <input value={productEditImageUrl} onChange={(event) => setProductEditImageUrl(event.target.value)} />
                </label>
                <label>
                  Тайлбар
                  <textarea value={productEditDescription} onChange={(event) => setProductEditDescription(event.target.value)} />
                </label>
                <div className="action-buttons">
                  <button type="submit" className="btn btn-primary">
                    {uploadingImage ? 'Upload хийж байна...' : 'Хадгалах'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onCancelProductEdit}>
                    Цуцлах
                  </button>
                </div>
              </form>
            )}
          </article>

          <article className="panel span-6">
            <h3>Ангиллын удирдлага</h3>
            <form className="form-grid" onSubmit={onCreateCategory}>
              <label>
                Ангиллын нэр
                <input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} required />
              </label>
              <label>
                Тайлбар
                <input
                  value={newCategoryDescription}
                  onChange={(event) => setNewCategoryDescription(event.target.value)}
                />
              </label>
              <button type="submit" className="btn btn-primary full">
                Ангилал нэмэх
              </button>
            </form>

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
                      <td data-label="Нэр">{category.name}</td>
                      <td data-label="Тайлбар">{category.description || '-'}</td>
                      <td data-label="Үйлдэл">
                        {categoryDeleteConfirmId === category.id ? (
                          <div className="action-buttons">
                            <button type="button" className="btn btn-danger" onClick={() => void onConfirmDeleteCategory(category.id)}>
                              Батлах
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setCategoryDeleteConfirmId('')}>
                              Цуцлах
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button type="button" className="btn btn-secondary" onClick={() => onStartCategoryEdit(category)}>
                              Засах
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => setCategoryDeleteConfirmId(category.id)}>
                              Устгах
                            </button>
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
                <h4>Ангилал засах</h4>
                <label>
                  Нэр
                  <input value={categoryEditName} onChange={(event) => setCategoryEditName(event.target.value)} required />
                </label>
                <label>
                  Тайлбар
                  <textarea
                    value={categoryEditDescription}
                    onChange={(event) => setCategoryEditDescription(event.target.value)}
                  />
                </label>
                <div className="action-buttons">
                  <button type="submit" className="btn btn-primary">
                    Хадгалах
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onCancelCategoryEdit}>
                    Цуцлах
                  </button>
                </div>
              </form>
            )}
          </article>
        </>
      )}

      {detailProduct && (
        <div className="modal-backdrop" onClick={() => setDetailProduct(null)}>
          <article className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Барааны дэлгэрэнгүй</h3>
              <button type="button" className="btn btn-secondary" onClick={() => setDetailProduct(null)}>
                Хаах
              </button>
            </div>

            <div className="detail-grid">
              <div className="panel">
                {detailProduct.imageUrl ? (
                  <img className="detail-image" src={detailProduct.imageUrl} alt={detailProduct.name} />
                ) : (
                  <div className="detail-image detail-image-empty">Зураг байхгүй</div>
                )}
                <h4 className="detail-title">{detailProduct.name}</h4>
                <p className="detail-subtitle">
                  {categoryNameById(detailProduct.categoryId)} · Код: {detailProduct.sku}
                </p>
                <p className="detail-price">
                  {formatPrice(detailProduct.price)} <span>/ ширхэг</span>
                </p>

                <div className="detail-meta-grid">
                  <div className="detail-meta-card">
                    <p>Ангилал</p>
                    <strong>{categoryNameById(detailProduct.categoryId)}</strong>
                  </div>
                  <div className="detail-meta-card">
                    <p>SKU</p>
                    <strong>{detailProduct.sku}</strong>
                  </div>
                  <div className="detail-meta-card">
                    <p>Төлөв</p>
                    <strong className="ok-text">Байгаа</strong>
                  </div>
                  <div className="detail-meta-card">
                    <p>Давхар</p>
                    <strong>{detailFloorPlan ? `${detailFloorPlan.floor}-р давхар` : 'Тодорхойгүй'}</strong>
                  </div>
                </div>

                <div className="location-highlight">
                  <p className="location-main">
                    {detailLocation
                      ? `${detailLocation.zone} · ${detailLocation.aisle}-р эгнээ · ${detailLocation.shelf}-р тавиур`
                      : detailPlacement
                        ? 'План зураг дээр координатаар байршсан.'
                        : 'Байршлын мэдээлэл байхгүй'}
                  </p>
                  {detailLocation?.note && <p className="location-note">{detailLocation.note}</p>}
                </div>

                <p className="muted">Тайлбар: {detailProduct.description || 'Тайлбар байхгүй'}</p>
              </div>

              <div className="panel">
                <h4>Байршил</h4>
                {detailFloorPlan && detailPlacement ? (
                  <>
                    <p className="muted">План: {detailFloorPlan.name}</p>
                    <p className="muted">Давхар: {detailFloorPlan.floor}</p>
                    <p className="muted">
                      Координат: ({detailPlacement.mapX}, {detailPlacement.mapY})
                    </p>
                    <FloorPlanCanvas
                      imageUrl={detailFloorPlan.imageUrl}
                      marker={{ x: detailPlacement.mapX, y: detailPlacement.mapY }}
                      emptyMessage="План зураг байхгүй байна."
                    />
                  </>
                ) : (
                  <p className="muted">План зураг эсвэл координатын мэдээлэл олдсонгүй.</p>
                )}
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  )
}

export default ProductsPage
