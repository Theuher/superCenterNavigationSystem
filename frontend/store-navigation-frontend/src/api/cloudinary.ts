interface CloudinaryUploadResponse {
  secure_url: string
}

const resolveEnv = () => {
  const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
  return {
    cloudName: env.VITE_CLOUDINARY_CLOUD_NAME || 'dsydokh2v',
    uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET || 'products_preset',
    folder: env.VITE_CLOUDINARY_FOLDER || 'Product',
  }
}

const resolveMapEnv = () => {
  const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
  return {
    cloudName: env.VITE_CLOUDINARY_CLOUD_NAME || 'dsydokh2v',
    uploadPreset: env.VITE_CLOUDINARY_MAP_UPLOAD_PRESET || env.VITE_CLOUDINARY_UPLOAD_PRESET || 'FloorPlan_preset',
    folder: env.VITE_CLOUDINARY_MAP_FOLDER || 'FloorPlans',
  }
}

export const uploadProductImage = async (file: File) => {
  const { cloudName, uploadPreset, folder } = resolveEnv()
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Image upload failed')
  }

  const data = (await response.json()) as CloudinaryUploadResponse
  if (!data.secure_url) {
    throw new Error('Cloudinary did not return secure_url')
  }

  return data.secure_url
}

export const uploadFloorPlanImage = async (file: File) => {
  const { cloudName, uploadPreset, folder } = resolveMapEnv()
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Image upload failed')
  }

  const data = (await response.json()) as CloudinaryUploadResponse
  if (!data.secure_url) {
    throw new Error('Cloudinary did not return secure_url')
  }

  return data.secure_url
}

