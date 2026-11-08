import type { Register } from 'claude-code'

// 수정 불가 고정 문장
const FIXED_PLAN = '아직 만들지마, 우리 조금 더 구상해보자'
const FIXED_BUILD = '이제 만들어줘.'

const AUTO_KEY = 'autoAppend'
const TOGGLE_SIGNAL = '/구상'
const BUILD_SIGNAL = '/만들어'

// 자동 문장이 붙은 메시지임을 사용자가 알 수 있도록, 답변 첫 줄에 표시하게 한다
const MODE_MARK = '🔒 구상 모드'
const MODE_MARK_NOTE = `[CONAS 프롬프트 모드] 이 메시지 끝의 "${FIXED_PLAN}" 문장은 사용자가 켜 둔 자동 추가 기능이 붙인 것입니다. 사용자의 화면에는 이 문장이 보이지 않으니, 답변의 맨 첫 줄에 "${MODE_MARK}"만 단독으로 적어 표시하고, 그 다음 줄부터 답하세요.`

function toggleNote(isOn: boolean): string {
  const line = isOn ? '구상 모드 켜짐' : '구상 모드 꺼짐'
  return `[CONAS 프롬프트 모드] 사용자가 /구상으로 구상 모드를 ${isOn ? '켰' : '껐'}습니다. 다른 말 없이 "${line}" 한 줄만 답하세요.`
}

// 사람이 직접 보낸 메시지가 아닌 것(알림, 예약 실행, 다른 세션 등)은 건드리지 않는다
const NOT_HUMAN = new Set([
  'task-notification',
  'scheduled-trigger',
  'peer',
  'peer-send-message',
  'projects-relay',
  'channel',
  'coordinator',
  'observer',
  'observer-activity',
  'auto-continuation',
])

export function isHumanTyped(isCommand: boolean, isMeta: boolean, originKind: string): boolean {
  return !isCommand && !isMeta && !NOT_HUMAN.has(originKind)
}

// 앱이 끼워 넣을 수 있는 보이지 않는 문자와 전각 슬래시를 정리한다
export function normalize(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[\p{Cf}\p{Cc}]/gu, '')
    .replace(/[／⁄∕⧸╱⟋]/g, '/')
    .trim()
}

// 앱이 메시지 앞에 붙이는 <system-reminder>…</system-reminder> 안내 문구를 걷어낸다
export function stripReminders(text: string): string {
  return text.replace(/(?:<|&lt;)system-reminder>[\s\S]*?(?:<|&lt;)\/system-reminder>/g, '')
}

// 안내 문구를 걷어내고, 명령어 태그로 감싸져 있으면 원래 입력으로 되돌린 '실제 입력'을 구한다
export function effective(raw: string): string {
  const text = stripReminders(raw)
  const name = text.match(/<command-name>\s*([^<]*?)\s*<\/command-name>/)?.[1]
  if (name) {
    const args = (text.match(/<command-args>([\s\S]*?)<\/command-args>/)?.[1] ?? '').trim()
    const slash = normalize(name).startsWith('/') ? normalize(name) : '/' + normalize(name)
    return normalize(args ? `${slash} ${args}` : slash)
  }
  if (/<[a-z-]+>/.test(text)) return normalize(text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '))
  return normalize(text)
}

// 공백·기호를 모두 빼고 "구상"만 남는 짧은 메시지(앞에 기호가 붙은 것)면 토글로 본다
export function isToggle(text: string): boolean {
  const n = effective(text)
  if (n === TOGGLE_SIGNAL) return true
  const bare = n.replace(/[\p{Z}\p{P}\p{S}]/gu, '')
  return bare === '구상' && n.length <= 6 && n !== '구상'
}

// /만들어 = 제작 신호: /만들어를 지우고 "이제 만들어줘."를 붙인다
export function toBuildText(text: string): string {
  const body = effective(text).split(BUILD_SIGNAL).join('').trim()
  return body ? `${body}\n\n${FIXED_BUILD}` : FIXED_BUILD
}

export function shouldAppend(text: string): boolean {
  const body = effective(text)
  if (!body || body.startsWith('/')) return false
  return !body.endsWith(FIXED_PLAN)
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    if (!isHumanTyped(e.command !== undefined, e.isMeta === true, e.origin.kind)) return next(e)

    // /구상: 켜짐/꺼짐을 바꾸고, Claude는 한 줄로만 상태를 알려준다 (꺼져 있어도 작동)
    if (isToggle(e.text)) {
      const isOn = (await $.store.get(AUTO_KEY)) === false
      await $.store.set(AUTO_KEY, isOn)
      return next({ ...e, text: TOGGLE_SIGNAL, context: [...(e.context ?? []), toggleNote(isOn)] })
    }

    if ((await $.store.get(AUTO_KEY)) === false) return next(e)

    if (effective(e.text).includes(BUILD_SIGNAL)) {
      return next({ ...e, text: toBuildText(e.text) })
    }
    if (!shouldAppend(e.text)) return next(e)

    return next({
      ...e,
      text: `${e.text.trimEnd()}\n\n${FIXED_PLAN}`,
      context: [...(e.context ?? []), MODE_MARK_NOTE],
    })
  })
}
