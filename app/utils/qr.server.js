import QRCode from 'qrcode'

/**
 * Generates a QR code as a base64 PNG data URL.
 * Runs server-side only (.server.js).
 *
 * @param {string} url - The URL to encode
 * @returns {Promise<string>} - data:image/png;base64,... string
 */
export async function generateQR(url) {
  return QRCode.toDataURL(url, {
    width:        256,
    margin:       2,
    errorCorrectionLevel: 'M',
    color: {
      dark:  '#111827',
      light: '#ffffff',
    },
  })
}
