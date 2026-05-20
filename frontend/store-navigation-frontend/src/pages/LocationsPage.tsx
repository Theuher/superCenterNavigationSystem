import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { createFloorPlan, deleteFloorPlan, listFloorPlans, updateFloorPlan } from '../api/catalog'
import { uploadFloorPlanImage } from '../api/cloudinary'
import { useAuth } from '../auth/AuthContext'
import type { FloorPlan } from '../types'

const LocationsPage = () => {
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['ROLE_MANAGER', 'ROLE_ADMIN'])

  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
  const [loadError, setLoadError] = useState('')
  const [planError, setPlanError] = useState('')
  const [uploadingPlanImage, setUploadingPlanImage] = useState(false)

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
  const [planEditModalOpen, setPlanEditModalOpen] = useState(false)
  const [planDeleteConfirmId, setPlanDeleteConfirmId] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  const loadData = async () => {
    setLoadError('')

    const [floorPlansResult] = await Promise.allSettled([listFloorPlans()])

    if (floorPlansResult.status === 'fulfilled') {
      setFloorPlans(floorPlansResult.value)
    } else {
      setFloorPlans([])
      setLoadError('План зурагийн мэдээлэл ачаалж чадсангүй.')
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

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
      await loadData()
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
    setPlanEditModalOpen(true)
  }

  const onCancelPlanEdit = () => {
    setPlanEditId('')
    setPlanEditName('')
    setPlanEditFloor('0')
    setPlanEditImageUrl('')
    setPlanEditImageFile(null)
    setPlanEditNote('')
    setPlanEditModalOpen(false)
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
      await loadData()
    } catch {
      setPlanError('План зураг шинэчлэх үед алдаа гарлаа.')
    }
  }

  const onConfirmDeletePlan = async (id: string) => {
    await deleteFloorPlan(id)
    setPlanDeleteConfirmId('')
    await loadData()
  }

  const renderPreview = (imageUrl: string, alt: string, className = 'plan-preview', isClickable = false) =>
    imageUrl ? (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        loading="lazy"
        {...(isClickable && {
          onClick: () => setImagePreviewUrl(imageUrl),
          style: { cursor: 'pointer' },
        })}
          style={{maxWidth: '5em', maxHeight: '5em', objectFit: 'cover'}}
      />
    ) : (
      <span className="muted">Зураг байхгүй</span>
    )

  if (!canManage) {
    return <Navigate to="/products" replace />
  }

  return (
    <section className="dashboard-grid">
      <article className="panel span-12">
        <h3>Дэлгүүрийн план зураг</h3>
        {loadError && <p className="error">{loadError}</p>}
        {planError && <p className="error">{planError}</p>}
        {uploadingPlanImage && <p className="muted">План зураг upload хийж байна...</p>}
      </article>

      <article className="panel span-12">
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
                  <td data-label="Зураг" className="plan-url-cell" >
                    {renderPreview(plan.imageUrl, plan.name, 'plan-preview', true)}
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
          <div className="plan-form-card panel">
            <h4>Шинэ план зураг</h4>
            <form className="plan-form" onSubmit={onCreatePlan}>
              <div className="plan-form-row">
                <label className="plan-form-input">
                  Нэр
                  <input value={planName} onChange={(event) => setPlanName(event.target.value)} required />
                </label>

                <label className="plan-form-input">
                  Давхар
                  <input type="number" value={planFloor} onChange={(event) => setPlanFloor(event.target.value)} required />
                </label>
              </div>

              <div className="plan-form-row">
                <label className="plan-form-input file-input">
                  PNG/JPG файл
                  <input type="file" accept="image/*" onChange={(event) => setPlanImageFile(event.target.files?.[0] || null)} />
                </label>

                <div className="plan-form-preview">
                  {planImageUrl ? (
                    <>
                      <p className="muted">Шинэ зураг (URL)</p>
                      {renderPreview(planImageUrl, 'Шинэ план зураг', 'plan-preview')}
                    </>
                  ) : (
                    planImageFile && (
                      <>
                        <p className="muted">Шинэ зураг (файл)</p>
                        {renderPreview(URL.createObjectURL(planImageFile), 'Шинэ план зураг', 'plan-preview')}
                      </>
                    )
                  )}
                </div>
              </div>

              <label className="full">
                Тэмдэглэл
                <textarea value={planNote} onChange={(event) => setPlanNote(event.target.value)} />
              </label>

              <div className="plan-form-actions">
                <button type="submit" className="btn btn-primary btn-full">
                  План хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      </article>

      {imagePreviewUrl && (
        <div className="modal-backdrop" onClick={() => setImagePreviewUrl('')}>
          <div className="modal-panel image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Зургийг том байдлаар харах</h3>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setImagePreviewUrl('')}
                style={{ marginLeft: 'auto' }}
              >
                ✕ Хаах
              </button>
            </div>
            <img src={imagePreviewUrl} alt="Full preview" className="image-preview-modal-content" />
          </div>
        </div>
      )}

      {planEditModalOpen && (
        <div className="modal-backdrop" onClick={onCancelPlanEdit}>
          <div className="modal-panel plan-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>План засах</h3>
              <button type="button" className="btn btn-secondary" onClick={onCancelPlanEdit} style={{ marginLeft: 'auto' }}>
                ✕ Хаах
              </button>
            </div>
            <form className="form-grid" onSubmit={onSubmitPlanEdit}>
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
              {planEditImageUrl && (
                <div className="full">
                  <p className="muted">Одоогийн зураг</p>
                  {planEditImageFile
                    ? renderPreview(URL.createObjectURL(planEditImageFile), 'План засах', 'plan-preview')
                    : renderPreview(planEditImageUrl, 'План засах', 'plan-preview')}
                </div>
              )}
              <label className="full">
                Тэмдэглэл
                <textarea value={planEditNote} onChange={(event) => setPlanEditNote(event.target.value)} />
              </label>
              <div className="action-buttons full">
                <button type="submit" className="btn btn-primary">Шинэчлэх</button>
                <button type="button" className="btn btn-secondary" onClick={onCancelPlanEdit}>Цуцлах</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default LocationsPage
