import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEventHandler, PointerEventHandler, WheelEventHandler } from 'react'

type MarkerPoint = {
  x: number
  y: number
}

type FloorPlanCanvasProps = {
  imageUrl?: string
  marker?: MarkerPoint | null
  onMarkerChange?: (point: MarkerPoint) => void
  emptyMessage?: string
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const FloorPlanCanvas = ({
  imageUrl,
  marker,
  onMarkerChange,
  emptyMessage = 'План зураг байхгүй байна.',
}: FloorPlanCanvasProps) => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragStateRef = useRef<{ pointerId: number; x: number; y: number } | null>(null)
  const movedRef = useRef(false)

  const baseScale = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height || !imageSize.width || !imageSize.height) {
      return 1
    }

    // Use contain-fit so the entire plan stays visible like LocationsPage.
    return Math.min(viewportSize.width / imageSize.width, viewportSize.height / imageSize.height)
  }, [viewportSize.width, viewportSize.height, imageSize.width, imageSize.height])

  const getFrame = (targetZoom: number) => {
    const scale = baseScale * targetZoom
    const width = imageSize.width * scale
    const height = imageSize.height * scale
    const centerX = (viewportSize.width - width) / 2
    const centerY = (viewportSize.height - height) / 2
    return { scale, width, height, centerX, centerY }
  }

  const currentFrame = useMemo(
    () => getFrame(zoom),
    [baseScale, imageSize.height, imageSize.width, viewportSize.height, viewportSize.width, zoom],
  )

  const clampPan = (nextPan: { x: number; y: number }, targetZoom: number) => {
    const frame = getFrame(targetZoom)
    const maxX = Math.max(0, (frame.width - viewportSize.width) / 2)
    const maxY = Math.max(0, (frame.height - viewportSize.height) / 2)
    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    }
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateViewportSize = () => {
      const rect = viewport.getBoundingClientRect()
      setViewportSize({ width: rect.width, height: rect.height })
    }

    updateViewportSize()
    const observer = new ResizeObserver(updateViewportSize)
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!imageUrl) {
      setImageSize({ width: 0, height: 0 })
      setZoom(1)
      setPan({ x: 0, y: 0 })
    }
  }, [imageUrl])

  useEffect(() => {
    if (!imageSize.width || !imageSize.height) return

    const viewport = viewportRef.current
    if (!viewport) return

    const rect = viewport.getBoundingClientRect()
    setViewportSize({ width: rect.width, height: rect.height })
  }, [imageSize])


  const zoomAtPoint = (nextScale: number, clientX: number, clientY: number) => {
    if (!viewportRef.current || !imageSize.width || !imageSize.height) {
      setZoom(nextScale)
      if (nextScale <= 1) setPan({ x: 0, y: 0 })
      return
    }

    const viewportRect = viewportRef.current.getBoundingClientRect()
    const pointerX = clientX - viewportRect.left
    const pointerY = clientY - viewportRect.top
    const currentFrame = getFrame(zoom)
    const currentLeft = currentFrame.centerX + pan.x
    const currentTop = currentFrame.centerY + pan.y
    const worldX = (pointerX - currentLeft) / currentFrame.scale
    const worldY = (pointerY - currentTop) / currentFrame.scale

    const targetFrame = getFrame(nextScale)
    const targetPan = {
      x: pointerX - targetFrame.centerX - worldX * targetFrame.scale,
      y: pointerY - targetFrame.centerY - worldY * targetFrame.scale,
    }

    setZoom(nextScale)
    setPan(nextScale <= 1 ? { x: 0, y: 0 } : clampPan(targetPan, nextScale))
  }

  const zoomStep = (delta: number) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const rect = viewport.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const nextScale = clamp(Number((zoom + delta).toFixed(2)), 1, 4)
    zoomAtPoint(nextScale, centerX, centerY)
  }

  const onWheel: WheelEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    const nextScale = clamp(Number((zoom + (event.deltaY < 0 ? 0.1 : -0.1)).toFixed(2)), 1, 4)
    zoomAtPoint(nextScale, event.clientX, event.clientY)
  }

  const canPan = zoom > 1

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!canPan) return
    dragStateRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY }
    movedRef.current = false
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId || !canPan) return

    const dx = event.clientX - dragState.x
    const dy = event.clientY - dragState.y
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      movedRef.current = true
    }

    setPan((prev) => clampPan({ x: prev.x + dx, y: prev.y + dy }, zoom))
    dragStateRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY }
  }

  const stopPointerDrag: PointerEventHandler<HTMLDivElement> = (event) => {
    const dragState = dragStateRef.current
    if (dragState?.pointerId === event.pointerId) {
      dragStateRef.current = null
      setIsDragging(false)
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    }
  }

  const onMapClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!onMarkerChange || !imageRef.current) return
    if (movedRef.current) {
      movedRef.current = false
      return
    }

    const imageRect = imageRef.current.getBoundingClientRect()
    if (
      event.clientX < imageRect.left
      || event.clientX > imageRect.right
      || event.clientY < imageRect.top
      || event.clientY > imageRect.bottom
    ) {
      return
    }

    const x = clamp(((event.clientX - imageRect.left) / imageRect.width) * 100, 0, 100)
    const y = clamp(((event.clientY - imageRect.top) / imageRect.height) * 100, 0, 100)
    onMarkerChange({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) })
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  if (!imageUrl) {
    return <div className="floor-map floor-map--photo floor-map-empty">{emptyMessage}</div>
  }

  return (
    <div className="floorplan-canvas">
      <div className="floorplan-controls">
        <button type="button" className="btn btn-secondary" onClick={() => zoomStep(-0.2)}>-</button>
        <button type="button" className="btn btn-secondary" onClick={() => zoomStep(0.2)}>+</button>
        <button type="button" className="btn btn-secondary" onClick={resetView}>Reset</button>
      </div>
      <div
        ref={viewportRef}
        className={`floorplan-viewport floor-map floor-map--photo${canPan ? ' is-zoomed' : ''}${isDragging ? ' is-dragging' : ''}`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopPointerDrag}
        onPointerCancel={stopPointerDrag}
        onPointerLeave={stopPointerDrag}
        onClick={onMapClick}
      >
        <div
          className="floorplan-content"
          style={{
            transform: `translate(${currentFrame.centerX + pan.x}px, ${currentFrame.centerY + pan.y}px) scale(${currentFrame.scale})`,
            width: `${imageSize.width}px`,
            height: `${imageSize.height}px`,
          }}
        >
          <img
            ref={imageRef}
            className="floor-map-image floorplan-image"
            src={imageUrl}
            alt="Floor plan"
            draggable={false}
            onLoad={(event) => {
              const image = event.currentTarget
              setImageSize({ width: image.naturalWidth || 1, height: image.naturalHeight || 1 })
            }}
          />
          <div className="map-layer">
            {marker && <span className="map-pin map-pin--selected" style={{ left: `${marker.x}%`, top: `${marker.y}%` }} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloorPlanCanvas




