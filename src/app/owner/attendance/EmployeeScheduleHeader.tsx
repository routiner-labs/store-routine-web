import type { KeyboardEvent } from 'react'
import { LiaAngleLeftSolid, LiaSearchSolid, LiaSlidersHSolid, LiaTimesSolid } from 'react-icons/lia'
import type { ScheduleFilterControls } from './useEmployeeScheduleFilters'
import styles from './EmployeeScheduleHeader.module.css'

export default function EmployeeScheduleHeader({
  title,
  onBack,
  controls,
}: {
  title: string
  onBack: () => void
  controls: ScheduleFilterControls
}) {
  function submitSearch(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') controls.applySearch()
  }

  return (
    <>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <LiaAngleLeftSolid aria-hidden="true" /> 출근 현황
        </button>
        <h1 className={styles.heading}>{title}</h1>
        <div className={styles.headerSearch}>
          <label className={styles.searchWrap}>
            <LiaSearchSolid className={styles.searchIcon} aria-hidden="true" />
            <input
              className={styles.searchInput}
              type="text"
              aria-label="헤더 직원 이름 검색"
              placeholder="직원 이름 검색"
              value={controls.searchText}
              onChange={(event) => controls.setSearchText(event.target.value)}
              onKeyDown={submitSearch}
            />
          </label>
          <button type="button" className={styles.searchBtn} onClick={controls.applySearch}>
            헤더 직원 검색
          </button>
        </div>
        <button
          type="button"
          className={`${styles.advBtn} ${controls.advancedOpen || controls.hasActiveFilters ? styles.advBtnActive : ''}`}
          aria-label="세부 검색"
          aria-expanded={controls.advancedOpen}
          aria-controls="schedule-advanced-search"
          onClick={controls.toggleAdvanced}
        >
          <LiaSlidersHSolid aria-hidden="true" />
          <span className={styles.advBtnLabel}>세부 검색</span>
        </button>
      </header>

      <div
        id="schedule-advanced-search"
        className={`${styles.advPanel} ${controls.advancedOpen ? styles.advPanelOpen : ''}`}
        aria-hidden={!controls.advancedOpen}
      >
        <div className={styles.advRow}>
          <span className={styles.advLabel}>직원 이름</span>
          <div className={styles.advSearchWrap}>
            <label className={styles.searchWrap}>
              <LiaSearchSolid className={styles.searchIcon} aria-hidden="true" />
              <input
                className={styles.searchInput}
                type="text"
                aria-label="세부검색 직원 이름 검색"
                placeholder="직원 이름 검색"
                value={controls.searchText}
                onChange={(event) => controls.setSearchText(event.target.value)}
                onKeyDown={submitSearch}
              />
            </label>
            <button type="button" className={styles.searchBtn} onClick={controls.applySearch}>
              세부검색 직원 검색
            </button>
            <button type="button" className={styles.resetBtn} onClick={controls.resetFilters}>
              <LiaTimesSolid aria-hidden="true" /> 필터 초기화
            </button>
          </div>
        </div>
        <div className={styles.advRow}>
          <span className={styles.advLabel}>근무 시간</span>
          <div className={styles.timeRange}>
            <div className={styles.timeInputs}>
              <input type="time" aria-label="근무 시간 시작" value={controls.draftStart} onChange={(event) => controls.setDraftStart(event.target.value)} />
              <span className={styles.timeSep} aria-hidden="true">~</span>
              <input type="time" aria-label="근무 시간 종료" value={controls.draftEnd} onChange={(event) => controls.setDraftEnd(event.target.value)} />
            </div>
            <button type="button" className={styles.applyBtn} disabled={!controls.canApplyTime} onClick={controls.applyTimeRange}>
              근무 시간 적용
            </button>
            <span
              className={`${styles.timeMessage} ${controls.timeMessageKind === 'error' ? styles.timeError : ''}`}
              data-message-kind={controls.timeMessageKind}
              role="status"
            >
              {controls.timeMessage}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
