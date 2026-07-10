import { StoreProvider } from '@/context/StoreContext'
import AnimatedMain from '@/components/AnimatedMain'
import OwnerNav from './OwnerNav'
import StoreBar from './StoreBar'
import styles from './layout.module.css'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className={styles.layout}>
        <OwnerNav />
        <div className={styles.content}>
          <StoreBar />
          <AnimatedMain className={`${styles.main} pageEnter`}>{children}</AnimatedMain>
        </div>
      </div>
    </StoreProvider>
  )
}
