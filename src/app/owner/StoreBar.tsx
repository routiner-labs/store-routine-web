'use client'

import { useState } from 'react'
import { useStore } from '@/context/StoreContext'
import StoreSwitcher from './StoreSwitcher'
import styles from './StoreBar.module.css'

export default function StoreBar() {
  const { currentStore } = useStore()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={styles.bar}>
        <button className={styles.btn} onClick={() => setOpen(true)}>
          <span className={styles.name}>{currentStore.name}</span>
          <span className={styles.chevron}>▾</span>
        </button>
      </div>
      {open && <StoreSwitcher onClose={() => setOpen(false)} />}
    </>
  )
}
