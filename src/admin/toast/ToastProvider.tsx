'use client'

import * as React from 'react'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastRecord = ToastInput & { id: string }

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

function variantClasses(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
    case 'error':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'info':
    default:
      return 'border-slate-200 bg-white text-slate-950'
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([])

  const toast = React.useCallback((input: ToastInput) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `t_${Date.now()}_${Math.random().toString(16).slice(2)}`

    const record: ToastRecord = {
      id,
      variant: input.variant ?? 'info',
      duration: input.duration ?? 2600,
      title: input.title,
      description: input.description,
    }

    setToasts((prev) => [record, ...prev].slice(0, 4))

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, record.duration)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2" suppressHydrationWarning>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'pointer-events-auto rounded-xl border p-4 shadow-[0_14px_50px_rgba(15,23,42,0.14)] backdrop-blur',
              variantClasses(t.variant ?? 'info'),
            ].join(' ')}
            suppressHydrationWarning
          >
            <div className="text-sm font-semibold">{t.title}</div>
            {t.description ? (
              <div className="mt-1 text-sm opacity-80">{t.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (ctx) return ctx

  return {
    toast: (input: ToastInput) => {
      if (typeof window !== 'undefined') {
        // Don't crash the admin if a provider boundary is missing for any reason.
        // This can happen during dev HMR or if an upstream layout fails to wrap.
        console.warn('[admin toast] ToastProvider missing:', input)
      }
    },
  }
}
