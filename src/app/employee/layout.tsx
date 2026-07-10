import AnimatedMain from '@/components/AnimatedMain'
import EmployeeNav from './EmployeeNav'
import barStyles from '../owner/StoreBar.module.css'
import styles from './layout.module.css'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <EmployeeNav />
      <div className={styles.content}>
        <div className={barStyles.bar}>
          <span className={barStyles.storeName}>스타벅스 강남점</span>
        </div>
        <AnimatedMain className={`${styles.main} pageEnter`}>{children}</AnimatedMain>
      </div>
    </div>
  )
}
