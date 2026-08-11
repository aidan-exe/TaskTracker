import { useState } from 'react'
import { X, Coffee, Sparkles, Clock, CheckCircle, QrCode } from 'lucide-react'
import { useTaskStore } from '../store'
import { PointsBadge } from './PointsBadge'
import { VoucherQRCode } from './VoucherQRCode'
import { VOUCHER_COSTS } from '../types'
import type { User, VoucherType, Voucher } from '../types'

interface Props {
  user: User
  onClose: () => void
}

export function VoucherRewards({ user, onClose }: Props) {
  const { redeemVoucher } = useTaskStore()
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherType | null>(null)
  const [qrVoucher, setQrVoucher] = useState<Voucher | null>(null)

  const handleRedeem = (voucherType: VoucherType) => {
    const success = redeemVoucher(user.id, voucherType)
    if (success) {
      setSelectedVoucher(voucherType)
      // Reset selection after animation
      setTimeout(() => setSelectedVoucher(null), 2000)
    }
  }

  const canAfford = (voucherType: VoucherType) => user.points >= VOUCHER_COSTS[voucherType]

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const activeVouchers = user.vouchers.filter((v) => !isExpired(v.expiresAt))
  const expiredVouchers = user.vouchers.filter((v) => isExpired(v.expiresAt))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              Reward Store
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Redeem your points for coffee vouchers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Points */}
          <div className="flex items-center justify-center">
            <PointsBadge points={user.points} size="lg" />
          </div>

          {/* Voucher Options */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Available Rewards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coffee Voucher */}
              <div className="rounded-lg border-2 border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3">
                    <Coffee className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Coffee</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Regular brewed coffee
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {VOUCHER_COSTS.coffee} pts
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRedeem('coffee')}
                    disabled={!canAfford('coffee') || selectedVoucher === 'coffee'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      canAfford('coffee')
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedVoucher === 'coffee' ? 'Redeemed!' : 'Redeem'}
                  </button>
                </div>
              </div>

              {/* Cappuccino Voucher */}
              <div className="rounded-lg border-2 border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3">
                    <Coffee className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Cappuccino</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Premium espresso drink
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {VOUCHER_COSTS.cappuccino} pts
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRedeem('cappuccino')}
                    disabled={!canAfford('cappuccino') || selectedVoucher === 'cappuccino'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      canAfford('cappuccino')
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedVoucher === 'cappuccino' ? 'Redeemed!' : 'Redeem'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Vouchers */}
          {activeVouchers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Your Vouchers
              </h3>
              <div className="space-y-2">
                {activeVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Coffee className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                        <div>
                          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 capitalize">
                            {voucher.type}
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            Redeemed {formatDate(voucher.redeemedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                        <Clock className="w-3 h-3" />
                        <span>Expires {formatDate(voucher.expiresAt)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQrVoucher(voucher)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      Show QR Code
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expired Vouchers */}
          {expiredVouchers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Expired Vouchers
              </h3>
              <div className="space-y-2 opacity-50">
                {expiredVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Coffee className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                          {voucher.type}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Expired {formatDate(voucher.expiresAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeVouchers.length === 0 && expiredVouchers.length === 0 && (
            <div className="text-center py-8">
              <Coffee className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No vouchers yet. Complete tasks to earn points!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {qrVoucher && (
        <VoucherQRCode
          voucher={qrVoucher}
          userName={user.name}
          onClose={() => setQrVoucher(null)}
        />
      )}
    </div>
  )
}
