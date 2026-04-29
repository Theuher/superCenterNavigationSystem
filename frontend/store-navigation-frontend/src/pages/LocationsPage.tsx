import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createFloorPlan,
  createLocation,
  deleteFloorPlan,
  deleteLocation,
  listCategories,
  listFloorPlans,
  listLocations,
  listProducts,
  updateFloorPlan,
  updateLocation,
} from '../api/catalog'
import { uploadFloorPlanImage } from '../api/cloudinary'
import { useAuth } from '../auth/AuthContext'
import type { Category, FloorPlan, Location, Product } from '../types'

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))
const toMapPosition = (x: number, y: number) => ({ top: `${clampPercent(y)}%`, left: `${clampPercent(x)}%` })

const LocationsPage = () => {
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'])

  const [locations, setLocations] = useState<Location[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
  const [loadError, setLoadError] = useState('')
  const [accessNote, setAccessNote] = useState('')
  const [planError, setPlanError] = useState('')
  const [uploadingPlanImage, setUploadingPlanImage] = useState(false)

  const [search, setSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedFloorPlanId, setSelectedFloorPlanId] = useState('')
  const [coordinateMode, setCoordinateMode] = useState<'create' | 'edit'>('create')

  const [code, setCode] = useState('')
  const [zone, setZone] = useState('')
  const [aisle, setAisle] = useState('')
  const [shelf, setShelf] = useState('')
  const [floor, setFloor] = useState('0')
  const [floorPlanId, setFloorPlanId] = useState('')
  const [mapX, setMapX] = useState('0')
  const [mapY, setMapY] = useState('0')
  const [note, setNote] = useState('')

  const [editId, setEditId] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editZone, setEditZone] = useState('')
  const [editAisle, setEditAisle] = useState('')
  const [editShelf, setEditShelf] = useState('')
  const [editFloor, setEditFloor] = useState('0')
  const [editFloorPlanId, setEditFloorPlanId] = useState('')
  const [editMapX, setEditMapX] = useState('0')
  const [editMapY, setEditMapY] = useState('0')
  const [editNote, setEditNote] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState('')

  const [planName, setPlanName] = useState('')
  const [planFloor, setPlanFloor] = useState('0')
  const [planImageUrl, setPlanImageUrl] = useState('')
  const [planImageFile, setPlanImageFile] = useState<File | null>(null)
  const [planNote, setPlanNote] = useState('')

  const [planEditId, setPlanEditId] = useState('')
  const [planEditName, setPlanEditName] = useState('')
  const [planEditFloor, setPlanEditFloor] = useState('0')
  const [planEditImageUrl, setPlanEditImageUrl] = useState('')
  const [planEditImageFile, setPlanEditImageFile] = useState<File | null>(null)
  const [planEditNote, setPlanEditNote] = useState('')
  const [planDeleteConfirmId, setPlanDeleteConfirmId] = useState('')

  const mapRef = useRef<HTMLDivElement | null>(null)

  const loadData = async (query?: string) => {
    setLoadError('')
    setAccessNote('')

    const [locationsResult, productsResult, categoriesResult, floorPlansResult] = await Promise.allSettled([
      listLocations(),
      listProducts(query),
      listCategories(),
      listFloorPlans(),
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

    if (floorPlansResult.status === 'fulfilled') {
      const plans = floorPlansResult.value
      setFloorPlans(plans)
      if (!selectedFloorPlanId && plans.length > 0) {
        setSelectedFloorPlanId(plans[0].id)
      }
      if (!floorPlanId && plans.length > 0) {
        setFloorPlanId(plans[0].id)
      }
    } else {
      setFloorPlans([])
      setLoadError('План зургийн мэдээлэл ачаалж чадсангүй.')
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

  useEffect(() => {
    if (selectedLocation?.floorPlanId) {
      setSelectedFloorPlanId(selectedLocation.floorPlanId)
    }
  }, [selectedLocation])

  const activeFloorPlan = useMemo(
    () => floorPlans.find((plan) => plan.id === (selectedLocation?.floorPlanId || selectedFloorPlanId)) || null,
    [floorPlans, selectedFloorPlanId, selectedLocation],
  )

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return []
    return products.filter((item) => item.id !== selectedProduct.id && item.locationId === selectedProduct.locationId).slice(0, 4)
  }, [products, selectedProduct])

  const nearbyLocations = useMemo(() => {
    if (!selectedLocation) return []
    return locations
      .filter((location) => location.id !== selectedLocation.id && location.floorPlanId === selectedLocation.floorPlanId)
      .map((location) => {
        const distance = Math.hypot(location.mapX - selectedLocation.mapX, location.mapY - selectedLocation.mapY)
        return { location, distance }
      })
      .filter((item) => item.distance <= 16)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6)
      .map((item) => item.location)
  }, [locations, selectedLocation])

  const productsByLocationId = useMemo(() => {
    const map = new Map<string, Product[]>()
    products.forEach((product) => {
      if (!product.locationId) return
      const existing = map.get(product.locationId)
      if (existing) {
        existing.push(product)
      } else {
        map.set(product.locationId, [product])
      }
    })
    return map
  }, [products])

  const categoryNameById = (id: string) => categories.find((item) => item.id === id)?.name || id
  const floorPlanNameById = (id: string) => floorPlans.find((item) => item.id === id)?.name || id

  const draftMapPosition = useMemo(() => {
    if (coordinateMode === 'edit' && editId) {
      return toMapPosition(Number(editMapX), Number(editMapY))
    }
    return toMapPosition(Number(mapX), Number(mapY))
  }, [coordinateMode, editId, editMapX, editMapY, mapX, mapY])

  const setCoordinatesFromClient = (clientX: number, clientY: number) => {
    if (!mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    const x = clampPercent(((clientX - rect.left) / rect.width) * 100)
    const y = clampPercent(((clientY - rect.top) / rect.height) * 100)

    if (coordinateMode === 'edit' && editId) {
      setEditMapX(x.toFixed(2))
      setEditMapY(y.toFixed(2))
      return
    }

    setMapX(x.toFixed(2))
    setMapY(y.toFixed(2))
  }

  const onMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setCoordinatesFromClient(event.clientX, event.clientY)
  }

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
      floorPlanId,
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
    setEditFloorPlanId(location.floorPlanId)
    setEditMapX(String(location.mapX))
    setEditMapY(String(location.mapY))
    setEditNote(location.note || '')
    setSelectedFloorPlanId(location.floorPlanId)
    setCoordinateMode('edit')
  }

  const onCancelEdit = () => {
    setEditId('')
    setEditCode('')
    setEditZone('')
    setEditAisle('')
    setEditShelf('')
    setEditFloor('0')
    setEditFloorPlanId('')
    setEditMapX('0')
    setEditMapY('0')
    setEditNote('')
    setCoordinateMode('create')
  }

  const onSubmitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await updateLocation(editId, {
      code: editCode,
      zone: editZone,
      aisle: editAisle,
      shelf: editShelf,
      floor: Number(editFloor),
      floorPlanId: editFloorPlanId,
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

  const resolvePlanImageUrl = async (file: File | null, manualUrl: string) => {
    if (file) {
      setUploadingPlanImage(true)
      try {
        return await uploadFloorPlanImage(file)
      } finally {
        setUploadingPlanImage(false)
      }
    }
    return manualUrl.trim()
  }

  const onCreatePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPlanError('')

    try {
      const imageUrl = await resolvePlanImageUrl(planImageFile, planImageUrl)
      if (!imageUrl) {
        setPlanError('План зураг заавал оруулна уу (файл эсвэл URL).')
        return
      }

      await createFloorPlan({
        name: planName,
        floor: Number(planFloor),
        imageUrl,
        note: planNote || undefined,
      })

      setPlanName('')
      setPlanFloor('0')
      setPlanImageUrl('')
      setPlanImageFile(null)
      setPlanNote('')
      await loadData(search)
    } catch {
      setPlanError('План зураг хадгалах үед алдаа гарлаа.')
    }
  }

  const onStartPlanEdit = (plan: FloorPlan) => {
    setPlanEditId(plan.id)
    setPlanEditName(plan.name)
    setPlanEditFloor(String(plan.floor))
    setPlanEditImageUrl(plan.imageUrl)
    setPlanEditImageFile(null)
    setPlanEditNote(plan.note || '')
    setSelectedFloorPlanId(plan.id)
  }

  const onCancelPlanEdit = () => {
    setPlanEditId('')
    setPlanEditName('')
    setPlanEditFloor('0')
    setPlanEditImageUrl('')
    setPlanEditImageFile(null)
    setPlanEditNote('')
  }

  const onSubmitPlanEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPlanError('')

    try {
      const imageUrl = await resolvePlanImageUrl(planEditImageFile, planEditImageUrl)
      if (!imageUrl) {
        setPlanError('План зургийн URL хоосон байж болохгүй.')
        return
      }

      await updateFloorPlan(planEditId, {
        name: planEditName,
        floor: Number(planEditFloor),
        imageUrl,
        note: planEditNote || undefined,
      })

      onCancelPlanEdit()
      await loadData(search)
    } catch {
      setPlanError('План зураг шинэчлэх үед алдаа гарлаа.')
    }
  }

  const onConfirmDeletePlan = async (id: string) => {
    await deleteFloorPlan(id)
    setPlanDeleteConfirmId('')
    if (planEditId === id) {
      onCancelPlanEdit()
    }
    if (selectedFloorPlanId === id) {
      setSelectedFloorPlanId('')
    }
    await loadData(search)
  }

  return (
    <section className="dashboard-grid">
      <article className="panel span-12">
        <h3>Хайлт ба план зураг</h3>
        {loadError && <p className="error">{loadError}</p>}
        {accessNote && <p className="muted">{accessNote}</p>}
        {planError && <p className="error">{planError}</p>}
        {uploadingPlanImage && <p className="muted">План зураг upload хийж байна...</p>}
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
          <div>
            <label>
              План зураг
              <select value={selectedFloorPlanId} onChange={(event) => setSelectedFloorPlanId(event.target.value)}>
                <option value="">План сонгох</option>
                {floorPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({plan.floor}-р давхар)
                  </option>
                ))}
              </select>
            </label>

            <div className="map-toolbar">
              <button
                type="button"
                className={`btn ${coordinateMode === 'create' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCoordinateMode('create')}
              >
                Шинэ цэг
              </button>
              <button
                type="button"
                className={`btn ${coordinateMode === 'edit' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCoordinateMode('edit')}
                disabled={!editId}
              >
                Засварын цэг
              </button>
              <p className="muted">План дээр дарж координат сонгоно.</p>
            </div>

            <div className="floor-map floor-map--photo" ref={mapRef} onClick={onMapClick}>
              {activeFloorPlan?.imageUrl ? (
                <img src={activeFloorPlan.imageUrl} alt={activeFloorPlan.name} className="floor-map-image" loading="lazy" />
              ) : (
                <div className="floor-map-empty">План зураг сонгоогүй байна</div>
              )}

              <div className="map-layer">
                {nearbyLocations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    className="map-pin map-pin--near"
                    style={toMapPosition(location.mapX, location.mapY)}
                    title={location.code}
                    onClick={(event) => {
                      event.stopPropagation()
                      const firstProduct = productsByLocationId.get(location.id)?.[0]
                      if (firstProduct) {
                        setSelectedProductId(firstProduct.id)
                      }
                    }}
                  />
                ))}

                {selectedLocation && <span className="map-pin map-pin--selected" style={toMapPosition(selectedLocation.mapX, selectedLocation.mapY)} />}

                <span className="map-pin map-pin--draft" style={draftMapPosition} />
              </div>
            </div>
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
                  <strong>План:</strong> {floorPlanNameById(selectedLocation.floorPlanId)}
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

            {/*{activeFloorPlan && (*/}
            {/*  <p className="muted">*/}
            {/*    План зургийн URL: <code>{activeFloorPlan.imageUrl}</code>*/}
            {/*  </p>*/}
            {/*)}*/}
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
                <th>План</th>
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
                  <td data-label="План">{floorPlanNameById(location.floorPlanId)}</td>
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
                План зураг
                <select value={floorPlanId} onChange={(event) => setFloorPlanId(event.target.value)} required>
                  <option value="">План сонгох</option>
                  {floorPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
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
                  План зураг
                  <select value={editFloorPlanId} onChange={(event) => setEditFloorPlanId(event.target.value)} required>
                    <option value="">План сонгох</option>
                    {floorPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
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

          <article className="panel span-12">
            <h3>План зураг оруулах / засах</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Нэр</th>
                    <th>Давхар</th>
                    <th>Зураг</th>
                    <th>Тэмдэглэл</th>
                    <th>Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {floorPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td data-label="Нэр">{plan.name}</td>
                      <td data-label="Давхар">{plan.floor}</td>
                      <td data-label="Зураг" className="plan-url-cell">
                        <code>{plan.imageUrl}</code>
                      </td>
                      <td data-label="Тэмдэглэл">{plan.note || '-'}</td>
                      <td data-label="Үйлдэл">
                        {planDeleteConfirmId === plan.id ? (
                          <div className="action-buttons">
                            <button type="button" className="btn btn-danger" onClick={() => void onConfirmDeletePlan(plan.id)}>
                              Батлах
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setPlanDeleteConfirmId('')}>
                              Цуцлах
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button type="button" className="btn btn-secondary" onClick={() => onStartPlanEdit(plan)}>
                              Засах
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => setPlanDeleteConfirmId(plan.id)}>
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

            <div className="plan-editor-grid">
              <form className="form-grid" onSubmit={onCreatePlan}>
                <h4>Шинэ план зураг</h4>
                <label>
                  Нэр
                  <input value={planName} onChange={(event) => setPlanName(event.target.value)} required />
                </label>
                <label>
                  Давхар
                  <input type="number" value={planFloor} onChange={(event) => setPlanFloor(event.target.value)} required />
                </label>
                <label>
                  PNG/JPG файл
                  <input type="file" accept="image/*" onChange={(event) => setPlanImageFile(event.target.files?.[0] || null)} />
                </label>
                <label>
                  Зургийн URL
                  <input value={planImageUrl} onChange={(event) => setPlanImageUrl(event.target.value)} />
                </label>
                <label className="full">
                  Тэмдэглэл
                  <textarea value={planNote} onChange={(event) => setPlanNote(event.target.value)} />
                </label>
                <button type="submit" className="btn btn-primary full">
                  План хадгалах
                </button>
              </form>

              {planEditId && (
                <form className="form-grid" onSubmit={onSubmitPlanEdit}>
                  <h4>План засах</h4>
                  <label>
                    Нэр
                    <input value={planEditName} onChange={(event) => setPlanEditName(event.target.value)} required />
                  </label>
                  <label>
                    Давхар
                    <input type="number" value={planEditFloor} onChange={(event) => setPlanEditFloor(event.target.value)} required />
                  </label>
                  <label>
                    Шинэ зураг
                    <input type="file" accept="image/*" onChange={(event) => setPlanEditImageFile(event.target.files?.[0] || null)} />
                  </label>
                  <label>
                    Зургийн URL
                    <input value={planEditImageUrl} onChange={(event) => setPlanEditImageUrl(event.target.value)} required />
                  </label>
                  <label className="full">
                    Тэмдэглэл
                    <textarea value={planEditNote} onChange={(event) => setPlanEditNote(event.target.value)} />
                  </label>
                  <div className="action-buttons full">
                    <button type="submit" className="btn btn-primary">
                      Шинэчлэх
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancelPlanEdit}>
                      Цуцлах
                    </button>
                  </div>
                </form>
              )}
            </div>
          </article>
        </>
      )}
    </section>
  )
}

export default LocationsPage
