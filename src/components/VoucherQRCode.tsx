import { X, Download, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { Voucher } from '../types'

interface Props {
  voucher: Voucher
  userName: string
  onClose: () => void
}

export function VoucherQRCode({ voucher, userName, onClose }: Props) {
  // Generate a unique voucher code
  const voucherCode = `VOUCHER-${voucher.type.toUpperCase()}-${voucher.id.slice(0, 8)}`
  
  // QR code data includes voucher details
  const qrData = JSON.stringify({
    code: voucherCode,
    type: voucher.type,
    user: userName,
    redeemed: voucher.redeemedAt,
    expires: voucher.expiresAt,
  })

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = () => {
    const svg = document.getElementById('voucher-qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `${voucherCode}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Voucher QR Code
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
            <QRCodeSVG
              id="voucher-qr-code"
              value={qrData}
              size={256}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* Voucher Info */}
          <div className="w-full space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700">
              <span className="text-2xl capitalize">{voucher.type === 'coffee' ? '☕' : '🥤'}</span>
              <span className="font-semibold text-emerald-900 dark:text-emerald-100 capitalize">
                {voucher.type}
              </span>
            </div>
            
            <p className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded px-3 py-1 inline-block">
              {voucherCode}
            </p>

            <div className="pt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p>Redeemed: {formatDate(voucher.redeemedAt)}</p>
              <p>Expires: {formatDate(voucher.expiresAt)}</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">For: {userName}</p>
            </div>
          </div>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors w-full justify-center"
          >
            <Download className="w-4 h-4" />
            Download QR Code
          </button>

          {/* Instructions */}
          <div className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              Show this QR code at the counter to redeem your voucher
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
