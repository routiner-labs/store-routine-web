import Link from 'next/link'
import styles from './page.module.css'

export default function RolePage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.logoMark}>루틴</div>
        <p className={styles.tagline}>
          알바생은 오늘 할 일을 확인하고<br />
          사장님은 문제 있는 것만 봅니다
        </p>
      </div>

      <div className={styles.roles}>
        <Link href="/owner" className={styles.roleBtn}>
          <span className={styles.roleIcon}>사장</span>
          <div className={styles.roleText}>
            <strong>사장님으로 입장</strong>
            <span>매장 현황과 이상 항목을 확인합니다</span>
          </div>
          <span className={styles.arrow}>›</span>
        </Link>
        <Link href="/employee" className={styles.roleBtn}>
          <span className={styles.roleIcon}>알바</span>
          <div className={styles.roleText}>
            <strong>알바생으로 입장</strong>
            <span>오늘 할 일과 업무리스트를 확인합니다</span>
          </div>
          <span className={styles.arrow}>›</span>
        </Link>
      </div>

      <p className={styles.hint}>데모 버전 · 실제 로그인 없음</p>
    </div>
  )
}
