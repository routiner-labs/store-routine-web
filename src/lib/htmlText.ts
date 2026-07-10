// 에디터(HTML) 내용과 구(舊) 평문 데이터를 함께 다루기 위한 유틸.

/** HTML 태그를 제거해 목록 미리보기용 평문으로 만든다. 평문이면 그대로 반환. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** 문자열이 HTML 태그를 포함하는지(에디터 출력 여부) */
export function isHtmlContent(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s)
}

/** 상세 렌더용: HTML이면 그대로, 평문(구 데이터)이면 <p>로 감싼다. */
export function contentToHtml(s: string): string {
  return isHtmlContent(s) ? s : `<p>${s}</p>`
}
