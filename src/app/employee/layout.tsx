import EmployeeNav from './EmployeeNav'
import styles from './layout.module.css'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>
      <EmployeeNav />
    </div>
  )
}
