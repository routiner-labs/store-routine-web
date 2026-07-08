'use client'

import { createContext, useContext, useState } from 'react'
import type { Store } from '@/types'

interface StoreCtx {
  currentStore: Store
  stores: Store[]
  switchStore: (id: string) => void
}

const StoreContext = createContext<StoreCtx | null>(null)

const MOCK_STORES: Store[] = [
  { id: '1', name: '스타벅스 강남점', address: '서울 강남구 강남대로 390' },
  { id: '2', name: '스타벅스 홍대점', address: '서울 마포구 와우산로 94' },
  { id: '3', name: '스타벅스 신촌점', address: '서울 서대문구 신촌로 141' },
]

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentStore, setCurrentStore] = useState<Store>(MOCK_STORES[0])

  function switchStore(id: string) {
    const store = MOCK_STORES.find((s) => s.id === id)
    if (store) setCurrentStore(store)
  }

  return (
    <StoreContext.Provider value={{ currentStore, stores: MOCK_STORES, switchStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
