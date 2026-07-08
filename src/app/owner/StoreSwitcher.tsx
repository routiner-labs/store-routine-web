'use client'

import { useStore } from '@/context/StoreContext'
import styles from './StoreSwitcher.module.css'

export default function StoreSwitcher({ onClose }: { onClose: () => void }) {
  const { currentStore, stores, switchStore } = useStore()

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <span className={styles.title}>매장 선택</span>
        <div className={styles.list}>
          {stores.map((store) => {
            const isActive = store.id === currentStore.id
            return (
              <button
                key={store.id}
                className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
                onClick={() => { switchStore(store.id); onClose() }}
              >
                <div>
                  <span className={styles.itemName}>{store.name}</span>
                  {store.address && <span className={styles.itemAddr}>{store.address}</span>}
                </div>
                {isActive && <span className={styles.check}>선택됨</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
