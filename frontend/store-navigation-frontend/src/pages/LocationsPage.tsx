import { useEffect, useMemo, useState } from 'react'
import { listCategories, listProducts, createLocation, deleteLocation, listLocations, updateLocation } from '../api/catalog'
import { useAuth } from '../auth/AuthContext'
import type { Category, Location, Product } from '../types'

const LocationsPage = () => {
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'])

  const [locations, setLocations] = useState<Location[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadError, setLoadError] = useState('')
  const [accessNote, setAccessNote] = useState('')

  const [search, setSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')

  const [code, setCode] = useState('')
  const [zone, setZone] = useState('')
  const [aisle, setAisle] = useState('')
  const [shelf, setShelf] = useState('')
  const [floor, setFloor] = useState('0')
  const [mapX, setMapX] = useState('0')
  const [mapY, setMapY] = useState('0')
  const [note, setNote] = useState('')

  const [editId, setEditId] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editZone, setEditZone] = useState('')
  const [editAisle, setEditAisle] = useState('')
  const [editShelf, setEditShelf] = useState('')
  const [editFloor, setEditFloor] = useState('0')
  const [editMapX, setEditMapX] = useState('0')
  const [editMapY, setEditMapY] = useState('0')
  const [editNote, setEditNote] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState('')

  const loadData = async (query?: string) => {
    setLoadError('')
    setAccessNote('')

    const [locationsResult, productsResult, categoriesResult] = await Promise.allSettled([
      listLocations(),
      listProducts(query),
      listCategories(),
    ])

    if (locationsResult.status === 'fulfilled') {
      setLocations(locationsResult.value)
    } else {
      setLocations([])
      setLoadError('Байршлын мэдээлэл ачаалж чадсангүй. Серверийн хандалтын эрхийг шалгана уу.')
    }

    if (productsResult.status === 'fulfilled') {
      setProducts(productsResult.value)
      if (!selectedProductId && productsResult.value.length > 0) {
        setSelectedProductId(productsResult.value[0].id)
      }
    } else {
      setProducts([])
      setLoadError('Барааны мэдээлэл ачаалж чадсангүй. Серверийн хандалтын эрхийг шалгана уу.')
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories(categoriesResult.value)
    } else {
      setCategories([])
      setAccessNote('Ангиллын мэдээлэлд зочин хандалт хаалттай байна. Хайлтын үндсэн функц ажиллана.')
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedProduct = useMemo(() => products.find((item) => item.id === selectedProductId) || null, [products, selectedProductId])
  const selectedLocation = useMemo(
    () => (selectedProduct ? locations.find((location) => location.id === selectedProduct.locationId) || null : null),
    [locations, selectedProduct],
  )

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return []
    return products.filter((item) => item.id !== selectedProduct.id && item.locationId === selectedProduct.locationId).slice(0, 4)
  }, [products, selectedProduct])

  const categoryNameById = (id: string) => categories.find((item) => item.id === id)?.name || id

  const mapPosition = useMemo(() => {
    if (!selectedLocation) return { top: '48%', left: '46%' }
    const normalizedX = Math.max(4, Math.min(95, selectedLocation.mapX))
    const normalizedY = Math.max(4, Math.min(95, selectedLocation.mapY))
    return { top: `${normalizedY}%`, left: `${normalizedX}%` }
  }, [selectedLocation])

  const onSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loadData(search)
  }

  const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await createLocation({
      code,
      zone,
      aisle,
      shelf,
      floor: Number(floor),
      mapX: Number(mapX),
      mapY: Number(mapY),
      note: note || undefined,
    })

    setCode('')
    setZone('')
    setAisle('')
    setShelf('')
    setFloor('0')
    setMapX('0')
    setMapY('0')
    setNote('')
    await loadData(search)
  }

  const onStartEdit = (location: Location) => {
    setEditId(location.id)
    setEditCode(location.code)
    setEditZone(location.zone)
    setEditAisle(location.aisle)
    setEditShelf(location.shelf)
    setEditFloor(String(location.floor))
    setEditMapX(String(location.mapX))
    setEditMapY(String(location.mapY))
    setEditNote(location.note || '')
  }

  const onCancelEdit = () => {
    setEditId('')
    setEditCode('')
    setEditZone('')
    setEditAisle('')
    setEditShelf('')
    setEditFloor('0')
    setEditMapX('0')
    setEditMapY('0')
    setEditNote('')
  }

  const onSubmitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await updateLocation(editId, {
      code: editCode,
      zone: editZone,
      aisle: editAisle,
      shelf: editShelf,
      floor: Number(editFloor),
      mapX: Number(editMapX),
      mapY: Number(editMapY),
      note: editNote || undefined,
    })
    onCancelEdit()
    await loadData(search)
  }

  const onConfirmDelete = async (id: string) => {
    await deleteLocation(id)
    setDeleteConfirmId('')
    if (editId === id) {
      onCancelEdit()
    }
    await loadData(search)
  }

  return (
    <section className="dashboard-grid">
      <article className="panel span-12">
        <h3>Хайлт ба план зураг</h3>
        {loadError && <p className="error">{loadError}</p>}
        {accessNote && <p className="muted">{accessNote}</p>}
        <form className="inline-form" onSubmit={onSearch}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Нэр, код, ангиллаар бараа хайх" />
          <button type="submit" className="btn btn-primary">
            Хайх
          </button>
        </form>
      </article>

      <article className="panel span-4">
        <h3>Сонгосон бараа</h3>
        <label>
          Бараа
          <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>

        {selectedProduct ? (
          <div className="card-list">
            <div className="product-row">
              <div className="product-icon">🛒</div>
              <div className="product-meta">
                <h4>{selectedProduct.name}</h4>
                <p>{categoryNameById(selectedProduct.categoryId)}</p>
              </div>
              <strong>₮{selectedProduct.price.toLocaleString()}</strong>
            </div>
            <p className="muted">SKU: {selectedProduct.sku}</p>
            <p className="muted">Тайлбар: {selectedProduct.description || 'Тайлбар байхгүй'}</p>
          </div>
        ) : (
          <p className="muted">Бараа сонгогдоогүй байна.</p>
        )}

        <h4>Ойролцоох бараа</h4>
        <div className="card-list">
          {relatedProducts.length === 0 ? (
            <p className="muted">Энэ байршилд өөр бараа алга.</p>
          ) : (
            relatedProducts.map((product) => (
              <div className="product-row" key={product.id}>
                {product.imageUrl ? (
                  <img className="product-thumb product-thumb--small" src={product.imageUrl} alt={product.name} loading="lazy" />
                ) : (
                  <div className="product-icon">📦</div>
                )}
                <div className="product-meta">
                  <h4>{product.name}</h4>
                  <p>{product.sku}</p>
                </div>
                <strong>₮{product.price.toLocaleString()}</strong>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="panel span-8">
        <h3>Дэлгүүрийн план зураг</h3>
        <div className="map-grid">
          <div className="floor-map">
            <span className="map-pin" style={mapPosition} />
          </div>

          <div>
            <h4>Байршлын дэлгэрэнгүй</h4>
            {selectedLocation ? (
              <div className="card-list">
                <p>
                  <strong>Код:</strong> {selectedLocation.code}
                </p>
                <p>
                  <strong>Давхар:</strong> {selectedLocation.floor}
                </p>
                <p>
                  <strong>Бүс:</strong> {selectedLocation.zone}
                </p>
                <p>
                  <strong>Эгнээ:</strong> {selectedLocation.aisle}
                </p>
                <p>
                  <strong>Тавиур:</strong> {selectedLocation.shelf}
                </p>
                <p>
                  <strong>Координат:</strong> ({selectedLocation.mapX}, {selectedLocation.mapY})
                </p>
                {selectedLocation.note && (
                  <p>
                    <strong>Тэмдэглэл:</strong> {selectedLocation.note}
                  </p>
                )}
              </div>
            ) : (
              <p className="muted">Энэ бараанд байршлын мэдээлэл холбогдоогүй байна.</p>
            )}
          </div>
        </div>
      </article>

      <article className="panel span-12">
        <h3>Байршлын бүртгэл</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Код</th>
                <th>Бүс</th>
                <th>Эгнээ</th>
                <th>Тавиур</th>
                <th>Давхар</th>
                <th>X</th>
                <th>Y</th>
                {canManage && <th>Үйлдэл</th>}
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td data-label="Код">{location.code}</td>
                  <td data-label="Бүс">{location.zone}</td>
                  <td data-label="Эгнээ">{location.aisle}</td>
                  <td data-label="Тавиур">{location.shelf}</td>
                  <td data-label="Давхар">{location.floor}</td>
                  <td data-label="X">{location.mapX}</td>
                  <td data-label="Y">{location.mapY}</td>
                  {canManage && (
                    <td data-label="Үйлдэл">
                      {deleteConfirmId === location.id ? (
                        <div className="action-buttons">
                          <button type="button" className="btn btn-danger" onClick={() => void onConfirmDelete(location.id)}>
                            Батлах
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirmId('')}>
                            Цуцлах
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button type="button" className="btn btn-secondary" onClick={() => onStartEdit(location)}>
                            Засах
                          </button>
                          <button type="button" className="btn btn-danger" onClick={() => setDeleteConfirmId(location.id)}>
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
            <h3>Шинэ байршил нэмэх</h3>
            <form className="form-grid" onSubmit={onCreate}>
              <label>
                Код
                <input value={code} onChange={(event) => setCode(event.target.value)} required />
              </label>
              <label>
                Бүс
                <input value={zone} onChange={(event) => setZone(event.target.value)} required />
              </label>
              <label>
                Эгнээ
                <input value={aisle} onChange={(event) => setAisle(event.target.value)} required />
              </label>
              <label>
                Тавиур
                <input value={shelf} onChange={(event) => setShelf(event.target.value)} required />
              </label>
              <label>
                Давхар
                <input type="number" value={floor} onChange={(event) => setFloor(event.target.value)} required />
              </label>
              <label>
                Координат X
                <input type="number" value={mapX} onChange={(event) => setMapX(event.target.value)} required />
              </label>
              <label>
                Координат Y
                <input type="number" value={mapY} onChange={(event) => setMapY(event.target.value)} required />
              </label>
              <label>
                Тэмдэглэл
                <input value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
              <button type="submit" className="btn btn-primary full">
                Байршил хадгалах
              </button>
            </form>
          </article>

          {editId && (
            <article className="panel span-6">
              <h3>Байршил засах</h3>
              <form className="form-grid" onSubmit={onSubmitEdit}>
                <label>
                  Код
                  <input value={editCode} onChange={(event) => setEditCode(event.target.value)} required />
                </label>
                <label>
                  Бүс
                  <input value={editZone} onChange={(event) => setEditZone(event.target.value)} required />
                </label>
                <label>
                  Эгнээ
                  <input value={editAisle} onChange={(event) => setEditAisle(event.target.value)} required />
                </label>
                <label>
                  Тавиур
                  <input value={editShelf} onChange={(event) => setEditShelf(event.target.value)} required />
                </label>
                <label>
                  Давхар
                  <input type="number" value={editFloor} onChange={(event) => setEditFloor(event.target.value)} required />
                </label>
                <label>
                  Координат X
                  <input type="number" value={editMapX} onChange={(event) => setEditMapX(event.target.value)} required />
                </label>
                <label>
                  Координат Y
                  <input type="number" value={editMapY} onChange={(event) => setEditMapY(event.target.value)} required />
                </label>
                <label>
                  Тэмдэглэл
                  <input value={editNote} onChange={(event) => setEditNote(event.target.value)} />
                </label>
                <div className="action-buttons full">
                  <button type="submit" className="btn btn-primary">
                    Шинэчлэх
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
                    Цуцлах
                  </button>
                </div>
              </form>
            </article>
          )}
        </>
      )}
    </section>
  )
}

export default LocationsPage
