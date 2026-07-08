import type { CSSProperties } from 'react'

// 카테고리 뱃지 색상 유틸.
// 카테고리마다 사용자가 RGB로 고른 색(hex) 하나를 저장하고,
// 뱃지는 "그 색의 옅은 배경(12% 틴트) + 진한 텍스트(원색)" 조합으로 렌더링한다.
// 색이 지정되지 않은 카테고리는 중립(회색) 스타일로 폴백한다.

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const p = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${p(r)}${p(g)}${p(b)}`.toUpperCase()
}

// 뱃지에 inline style로 적용할 색상 값.
// 텍스트는 --category-badge-text-mix(라이트 100% = 원색, 다크 62% = 흰색을 섞어 밝게)로
// 테마에 맞게 자동 보정된다.
export function categoryBadgeStyle(color?: string): CSSProperties {
  if (!color) {
    return {
      background: 'var(--color-bg)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    }
  }
  const { r, g, b } = hexToRgb(color)
  return {
    background: `rgba(${r}, ${g}, ${b}, 0.12)`,
    color: `color-mix(in srgb, ${color} var(--category-badge-text-mix, 100%), #fff)`,
  }
}
