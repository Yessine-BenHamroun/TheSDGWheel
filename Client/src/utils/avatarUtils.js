/**
 * Constructs the proper avatar URL based on the avatar data
 * @param {string} avatar - The avatar data (base64, URL, or file path)
 * @returns {string} - The proper avatar URL or placeholder
 */
export const getAvatarUrl = (avatar) => {
  if (!avatar || avatar === null || avatar === undefined || avatar === '') {
    return "/placeholder.svg"
  }

  // If it's already a full HTTP/HTTPS URL, use it directly
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }

  // If it's base64 data, use it directly
  if (avatar.startsWith('data:image/')) {
    return avatar
  }

  // If it's a local file path, construct the full URL
  if (avatar.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'
    return `${baseUrl}${avatar}`
  }

  // If it's some other format, try to use it as is (fallback)
  return avatar || "/placeholder.svg"
}

/**
 * Constructs the proper media URL based on the media data
 * @param {string} mediaUrl - The media URL (can be absolute URL or file path)
 * @returns {string} - The proper media URL
 */
export const getMediaUrl = (mediaUrl) => {
  if (!mediaUrl) {
    return null
  }

  // If it's already a full HTTP/HTTPS URL, use it directly
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl
  }

  // If it's base64 data, use it directly
  if (mediaUrl.startsWith('data:')) {
    return mediaUrl
  }

  // If it's a local file path, construct the full URL
  if (mediaUrl.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'
    return `${baseUrl}${mediaUrl}`
  }

  // If it's some other format, try to use it as is (fallback)
  return mediaUrl
}
