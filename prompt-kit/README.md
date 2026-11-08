# prompt-kit

> Claude가 **바로 만들지 않고, 먼저 같이 구상하게** 해주는 프롬프트 도구 모음
> 만든 곳: CONAS · Anthropic 공식 도구가 아닙니다.

## 무엇이 들어 있나요?

| 기능 | 쓰는 법 | 하는 일 |
| --- | --- | --- |
| 프롬프트 위젯 | "프롬프트 위젯 띄워줘" | 9가지 템플릿(구상, 기능 수정, 오류 해결, 문서·보고서, 공부 질문, 게임 기획, 홍보 문구, 회의록, 자유 요청)을 골라 빈칸만 채우면 잘 짜인 요청을 Claude에게 바로 보내요. |
| 구상 모드 | 처음부터 켜져 있음 | 보내는 메시지 끝에 "아직 만들지마, 우리 조금 더 구상해보자"를 자동으로 붙여요. Claude는 바로 만들지 않고 구성안과 질문부터 보여줘요. |
| 켜기/끄기 | `/구상` | 보낼 때마다 구상 모드가 켜지고 꺼져요. |
| 만들기 신호 | 메시지에 `/만들어` 넣기 | 구상이 끝났다는 뜻이에요. Claude가 그동안 정한 내용으로 만들기 시작해요. |

## 설치 방법

### Claude 데스크톱 앱
1. 입력창 옆 **+** 버튼 → **Plugins** → **Add marketplace**
2. `conascode/conas-public` 입력
3. **Add plugin**에서 **prompt-kit** 선택

### 터미널 (Claude Code)
```
/plugin install prompt-kit --marketplace conascode/conas-public
```

## 사용 예시

1. 평소처럼 보내요: `동아리 출석 체크 웹앱 만들고 싶어`
2. Claude 답변 첫 줄에 **🔒 구상 모드**가 뜨고, 구성안과 질문이 와요.
3. 몇 번 주고받으며 정해요.
4. 다 정했으면: `좋아 B안으로 /만들어`
5. Claude가 만들기 시작해요.

위젯을 쓰고 싶으면 "프롬프트 위젯 띄워줘"라고 하세요. 템플릿을 고르고 빈칸을 채운 뒤 **구상 요청 보내기**, 다 정했으면 **이제 만들어줘** 버튼을 누르면 돼요.

## 알아두세요

- **구상 모드가 하는 일은 하나예요.** 내가 보내는 메시지 끝에 문장 하나를 붙이는 것뿐이에요. 내 메시지를 다른 곳으로 보내거나 저장하지 않아요. 코드는 이 저장소에 전부 공개돼 있어요.
- 붙은 문장은 **내 화면에는 안 보여요.** 대신 Claude 답변 첫 줄의 🔒 표시로 확인할 수 있어요.
- 쓰는 Claude 화면에 따라 **구상 모드가 작동하지 않을 수 있어요.** 그래도 위젯은 쓸 수 있어요.
- "이제 만들어"라고 직접 써도 만들기 신호가 **아니에요.** 꼭 `/만들어`를 넣어주세요.

## 이용 규칙

자유롭게 사용, 수정, 재배포할 수 있어요. 다시 나눠줄 때는 원본 저장소 링크(https://github.com/conascode/conas-public)를 꼭 함께 적어주세요. 판매는 할 수 없어요. 자세한 내용은 [LICENSE](./LICENSE)를 확인하세요.

---

**CONAS는 허구이며 실재한다.**
/만들어 CONAS

---

## English

**prompt-kit** is a toolkit that encourages Claude to deliberate before it builds.
Rather than producing a finished result outright, Claude first proposes a structure,
outlines the available options, and raises clarifying questions.
Developed by CONAS. This is not an official Anthropic product.

> **Note: prompt-kit is designed for Korean-speaking users.**
> All templates, commands (`/구상`, `/만들어`), and the planning prompt are written in Korean,
> and Claude is instructed to respond in Korean.

### Features
- **Prompt widget** — Ask Claude to "프롬프트 위젯 띄워줘" (display the prompt widget).
  Select one of nine templates, complete the fields, and submit a well-structured request in a single click.
- **Planning mode** (enabled by default) — Appends the sentence
  "아직 만들지마, 우리 조금 더 구상해보자" ("Hold off on building; let's refine the plan")
  to each outgoing message, prompting Claude to respond with a plan and questions.
- **`/구상`** — Toggles planning mode on or off.
- **`/만들어`** — Include this anywhere in a message once the plan is settled; Claude will proceed to build.

### Installation
- **Desktop app**: **+** → **Plugins** → **Add marketplace** → `conascode/conas-public` → **Add plugin** → **prompt-kit**
- **Terminal**: `/plugin install prompt-kit --marketplace conascode/conas-public`

### Notes
Planning mode performs a single operation: it appends one sentence to your outgoing messages.
It neither transmits nor retains your messages elsewhere, and its source code is publicly available in this repository.
Depending on the Claude client in use, planning mode may not be supported; the widget remains fully functional regardless.

### License
You may use, modify, and redistribute prompt-kit free of charge, provided that any redistribution
includes a link to https://github.com/conascode/conas-public. Selling it is not permitted.
See [LICENSE](./LICENSE) for details.

---

**CONAS is apocryphal and actual.**
/만들어 CONAS
