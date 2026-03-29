import { useEffect, useState } from 'react'
import { createLocation, deleteLocation, listLocations, updateLocation } from '../api/catalog'
import { useAuth } from '../auth/AuthContext'
import type { Location } from '../types'

const LocationsPage = () => {
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'])

  const [locations, setLocations] = useState<Location[]>([])

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

  const loadLocations = async () => {
    const data = await listLocations()
    setLocations(data)
  }

  useEffect(() => {
    void loadLocations()
  }, [])

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
    await loadLocations()
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
    await loadLocations()
  }

  const onConfirmDelete = async (id: string) => {
    await deleteLocation(id)
    setDeleteConfirmId('')
    if (editId === id) {
      onCancelEdit()
    }
    await loadLocations()
  }

  return (
    <section className="grid-section">
      <article className="card full-width">
        <h2>Байршлууд</h2>
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
                  <td>{location.code}</td>
                  <td>{location.zone}</td>
                  <td>{location.aisle}</td>
                  <td>{location.shelf}</td>
                  <td>{location.floor}</td>
                  <td>{location.mapX}</td>
                  <td>{location.mapY}</td>
                  {canManage && (
                    <td>
                      {deleteConfirmId === location.id ? (
                        <div className="action-buttons">
                          <button type="button" onClick={() => void onConfirmDelete(location.id)}>Тийм</button>
                          <button type="button" onClick={() => setDeleteConfirmId('')}>Үгүй</button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button type="button" onClick={() => onStartEdit(location)}>Засах</button>
                          <button type="button" onClick={() => setDeleteConfirmId(location.id)}>Устгах</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canManage && editId && (
          <form className="sub-card" onSubmit={onSubmitEdit}>
            <h3>Байршил засах</h3>
            <label>
              Код
              <input value={editCode} onChange={(e) => setEditCode(e.target.value)} required />
            </label>
            <label>
              Бүс
              <input value={editZone} onChange={(e) => setEditZone(e.target.value)} required />
            </label>
            <label>
              Эгнээ
              <input value={editAisle} onChange={(e) => setEditAisle(e.target.value)} required />
            </label>
            <label>
              Тавиур
              <input value={editShelf} onChange={(e) => setEditShelf(e.target.value)} required />
            </label>
            <label>
              Давхар
              <input type="number" value={editFloor} onChange={(e) => setEditFloor(e.target.value)} required />
            </label>
            <label>
              Газрын зураг X
              <input type="number" value={editMapX} onChange={(e) => setEditMapX(e.target.value)} required />
            </label>
            <label>
              Газрын зураг Y
              <input type="number" value={editMapY} onChange={(e) => setEditMapY(e.target.value)} required />
            </label>
            <label>
              Тэмдэглэл
              <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} />
            </label>
            <div className="action-buttons">
              <button type="submit">Хадгалах</button>
              <button type="button" onClick={onCancelEdit}>Цуцлах</button>
            </div>
          </form>
        )}
      </article>

      {canManage && (
        <form className="card" onSubmit={onCreate}>
          <h3>Байршил нэмэх</h3>
          <label>
            Код
            <input value={code} onChange={(e) => setCode(e.target.value)} required />
          </label>
          <label>
            Бүс
            <input value={zone} onChange={(e) => setZone(e.target.value)} required />
          </label>
          <label>
            Эгнээ
            <input value={aisle} onChange={(e) => setAisle(e.target.value)} required />
          </label>
          <label>
            Тавиур
            <input value={shelf} onChange={(e) => setShelf(e.target.value)} required />
          </label>
          <label>
            Давхар
            <input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} required />
          </label>
          <label>
            Газрын зураг X
            <input type="number" value={mapX} onChange={(e) => setMapX(e.target.value)} required />
          </label>
          <label>
            Газрын зураг Y
            <input type="number" value={mapY} onChange={(e) => setMapY(e.target.value)} required />
          </label>
          <label>
            Тэмдэглэл
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button type="submit">Байршил үүсгэх</button>
        </form>
      )}
    </section>
  )
}

export default LocationsPage




