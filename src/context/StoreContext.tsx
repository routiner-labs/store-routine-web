'use client'

import { createContext, useContext, useState } from 'react'
import type { Store } from '@/types'

interface StoreCtx {
  currentStore: Store
  stores: Store[]
  switchStore: (id: string) => void
  addStore: (name: string, address: string) => Store
  updateStore: (id: string, patch: { name: string; address: string }) => void
}

const StoreContext = createContext<StoreCtx | null>(null)

const MOCK_STORES: Store[] = [
  { id: '1', name: '스타벅스 강남점', address: '서울 강남구 강남대로 390', code: '10293847' },
  { id: '2', name: '스타벅스 홍대점', address: '서울 마포구 와우산로 94', code: '20481036' },
  { id: '3', name: '스타벅스 신촌점', address: '서울 서대문구 신촌로 141', code: '30587219' },
]

// 매장 식별번호: 시스템이 생성하는 8자리 숫자
function generateStoreCode() {
  return String(Math.floor(10000000 + Math.random() * 90000000))
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>(MOCK_STORES)
  const [currentStore, setCurrentStore] = useState<Store>(MOCK_STORES[0])

  function switchStore(id: string) {
    const store = stores.find((s) => s.id === id)
    if (store) setCurrentStore(store)
  }

  // 목업이라 세션 내에서만 유지 (새로고침 시 초기화 — addRequest 등과 동일)
  function addStore(name: string, address: string): Store {
    const store: Store = { id: `store-${Date.now()}`, name, address, code: generateStoreCode() }
    setStores((prev) => [...prev, store])
    return store
  }

  function updateStore(id: string, patch: { name: string; address: string }) {
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    setCurrentStore((prev) => (prev.id === id ? { ...prev, ...patch } : prev))
  }

  return (
    <StoreContext.Provider value={{ currentStore, stores, switchStore, addStore, updateStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
