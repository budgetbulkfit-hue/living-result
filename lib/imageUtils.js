/** Append Cloudinary auto-format/quality transforms when applicable. */
export function optimizeImageUrl(src, width = 400) {
  if (!src || typeof src !== 'string') return src;
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    return src.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  return src;
}
