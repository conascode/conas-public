---
name: "prompt-widget"
description: "사용자가 /prompt-widget을 입력하거나 '프롬프트 위젯', '템플릿 위젯'을 띄워달라고 할 때, 9가지 템플릿의 CONAS 프롬프트 입력 위젯을 채팅 안에 띄운다."
---

# CONAS 프롬프트 위젯

사용자가 템플릿(구상, 기능 수정, 오류 해결, 문서·보고서, 공부 질문, 게임 기획, 홍보 문구, 회의록, 자유 요청)을 고르고 빈칸·선택 버튼을 채워 Claude에게 바로 보내는 입력 위젯을 채팅 안에 띄운다.

## 절차

1. Visualizer의 `read_me`를 `interactive` 모듈로 조용히 불러온다(이 호출은 언급하지 않는다). 도구가 지연 로딩이면 ToolSearch로 `mcp__visualize__read_me`, `mcp__visualize__show_widget`을 먼저 불러온다.
2. `show_widget`을 호출한다. `title`은 `conas_prompt_widget`, `widget_code`는 아래 코드를 **한 글자도 바꾸지 말고 그대로** 넣는다. 사용자가 이번 요청에서 바꿔달라고 한 부분이 있을 때만 그 부분을 고친다.
3. 위젯 아래에 한국어로 한두 줄만 적는다: 템플릿 고르기 → `*` 칸 채우고 선택 버튼 고르기 → "구상 요청 보내기", 구상이 끝나면 "이제 만들어줘".

## 규칙

- 답변은 항상 한국어로 한다.
- 고정 문장 "아직 만들지마, 우리 조금 더 구상해보자"는 수정하지 않는다.
- 위젯에서 보낸 요청(끝이 고정 문장)에는 결과물을 만들지 말고, `<planning>`에 적힌 대로 구성안·선택지·질문만 답한다. `<options>`의 답변 길이를 따른다.
- 메시지에 "/만들어"가 있거나 "이제 만들어줘."가 오면 그때까지 구상한 내용으로 만든다. 위젯의 "이제 만들어줘" 버튼은 "이제 /만들어"를 보낸다.

## 위젯 코드

```html
<style>
.pw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:0 0 1.25rem}
.pw-grid button{display:flex;align-items:center;gap:6px;justify-content:flex-start;font-size:14px;padding:8px 10px}
.pw-f{margin:0 0 14px}
.pw-f>label,.pw-f>.pw-lb{display:block;font-size:13px;color:var(--text-secondary);margin:0 0 6px}
.pw-f textarea{width:100%;box-sizing:border-box;min-height:40px;font:inherit;font-size:14px;padding:8px 10px;border:0.5px solid var(--border-strong);border-radius:var(--radius);background:transparent;color:var(--text-primary);resize:vertical}
.pw-chips{display:flex;flex-wrap:wrap;gap:6px}
.pw-chips button{font-size:13px;padding:4px 10px;min-height:0;height:auto;display:inline-flex;align-items:center;gap:4px}
.pw-req{color:var(--text-danger);margin-left:2px}
.pw-err{font-size:13px;color:var(--text-danger);margin:6px 0 0}
.pw-pre{white-space:pre-wrap;font-family:var(--font-mono);font-size:12px;line-height:1.6;background:var(--surface-1);border-radius:var(--radius);padding:10px 12px;margin:8px 0 0;color:var(--text-secondary)}
</style>
<h2 class="sr-only">CONAS 프롬프트 위젯: 9가지 템플릿 중 하나를 고르고 빈칸과 선택지를 채워 Claude에게 바로 보낸다</h2>
<div style="padding:1rem 0">
  <div class="pw-grid" id="pwGrid"></div>
  <p id="pwDesc" style="font-size:13px;color:var(--text-secondary);margin:0 0 1rem"></p>
  <div id="pwFields"></div>
  <div class="pw-f" style="border-top:0.5px solid var(--border);padding-top:14px">
    <span class="pw-lb">답변 길이</span>
    <div class="pw-chips" id="pwLen"></div>
  </div>
  <details style="margin:0 0 14px">
    <summary style="font-size:13px;color:var(--text-secondary);cursor:pointer">보낼 요청문 미리보기</summary>
    <div class="pw-pre" id="pwPre"></div>
  </details>
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <button id="pwSend"><i class="ti ti-bulb" aria-hidden="true" style="font-size:16px"></i> 구상 요청 보내기 ↗</button>
    <button id="pwBuild"><i class="ti ti-hammer" aria-hidden="true" style="font-size:16px"></i> 이제 만들어줘 ↗</button>
    <button id="pwReset"><i class="ti ti-refresh" aria-hidden="true" style="font-size:16px"></i> 비우기</button>
  </div>
  <p class="pw-err" id="pwErr"></p>
</div>
<script>
(function(){
var PLAN="아직 만들지마, 우리 조금 더 구상해보자";
var BUILD="이제 /만들어";
var TPL=[
 {id:"plan",name:"구상",icon:"bulb",desc:"새로 만들고 싶은 게 있을 때",tag:"request",f:[["만들 것","t","예: 동아리 출석 체크 웹앱",1],["목적","t","왜 필요한지, 누가 쓰는지"],["사용 환경","c",["모바일","PC","둘 다"]],["결과 형태","c",["웹앱(단일 HTML)","문서","슬라이드","코드","기타"]],["참고","t","비슷한 서비스, 원하는 느낌"]],p:"구성안, 고를 수 있는 선택지, 확인이 필요한 질문을 정리해줘."},
 {id:"fix",name:"기능 수정",icon:"tool",desc:"기존 프로젝트를 바꿀 때",tag:"change",f:[["프로젝트","t","프로젝트 이름",1],["현재 상태","t","지금 어떻게 작동하는지"],["바꿀 부분","t","추가하거나 수정할 기능",1],["원하는 결과","t","바뀐 뒤 어떻게 돼야 하는지"],["유지할 부분","t","건드리지 말아야 할 기능·디자인"]],p:"어떤 부분을 어떻게 바꿀지, 기존 기능에 영향이 있는지 먼저 정리해줘."},
 {id:"bug",name:"오류 해결",icon:"bug",desc:"뭔가 안 될 때",tag:"problem",f:[["증상","t","어떤 상황에서 무엇이 안 되는지",1],["기대한 동작","t","원래 어떻게 돼야 하는지"],["오류 메시지","t","화면이나 콘솔에 뜬 메시지"],["환경","c",["크롬","사파리","모바일","서버(PHP)","기타"]],["시도해본 것","t","이미 해본 방법"]],p:"가능한 원인을 가능성 높은 순으로 짚고, 확인할 방법을 먼저 알려줘."},
 {id:"doc",name:"문서·보고서",icon:"file-text",desc:"보고서, 제안서, 정리 글",tag:"document",f:[["주제","t","예: 버튜버 시장 현황",1],["읽는 사람","t","선생님, 팀원, 회사 등"],["용도","c",["과제","팀 공유","제안서","개인 정리"]],["분량","c",["3줄","1페이지","여러 페이지"]],["꼭 넣을 내용","t","빠지면 안 되는 항목"]],p:"목차와 각 부분에 들어갈 내용, 확인이 필요한 질문을 먼저 정리해줘."},
 {id:"study",name:"공부 질문",icon:"school",desc:"모르는 개념을 배울 때",tag:"study",f:[["과목·주제","t","예: 조건부확률",1],["모르는 부분","t","어디서 막혔는지",1],["내 수준","c",["처음 배움","기초는 앎","복습 중"]],["원하는 방식","c",["개념부터","예제 위주","문제 풀이"]]],p:"내 수준에 맞춰 어떤 순서로 설명할지 먼저 정리하고, 내가 이해했는지 확인할 질문도 같이 줘."},
 {id:"game",name:"게임 기획",icon:"device-gamepad-2",desc:"웹게임 아이디어",tag:"game",f:[["장르","t","예: 경영 시뮬레이션",1],["콘셉트","t","세계관, 주인공, 분위기"],["핵심 재미","t","플레이어가 계속 하게 되는 이유"],["플랫폼","c",["모바일","PC","둘 다"]]],p:"게임의 핵심 루프, 주요 화면, 정해야 할 선택지를 먼저 정리해줘."},
 {id:"promo",name:"홍보 문구",icon:"speakerphone",desc:"공지, SNS, 포스터 문구",tag:"promotion",f:[["홍보할 것","t","예: CONAS 신규 서비스",1],["채널","c",["인스타그램","카카오톡","포스터","웹사이트"]],["톤","c",["친근하게","깔끔하게","유쾌하게","진지하게"]],["핵심 메시지","t","꼭 전하고 싶은 한 가지"]],p:"방향이 다른 문구 방향 2~3가지와 각각의 느낌을 먼저 보여줘."},
 {id:"meet",name:"회의록",icon:"notes",desc:"회의 메모 정리",tag:"meeting",f:[["회의 이름","t","예: 11월 정기 회의",1],["참석자","t","이름을 쉼표로"],["메모","t","회의 중 적은 내용 그대로",1]],p:"안건, 결정사항, 할 일과 담당자로 어떻게 나눌지 먼저 보여주고, 애매한 부분은 질문해줘."},
 {id:"free",name:"자유 요청",icon:"message",desc:"양식 없이 말하듯이",tag:"request",f:[["하고 싶은 말","t","무엇이든 편하게",1]],p:"내 요청을 어떻게 이해했는지 먼저 정리하고, 필요한 질문을 해줘."}
];
var LENS=["짧게","보통","자세히"];
var cur=TPL[0],vals={},picks={},len="보통";
function g(id){return document.getElementById(id);}
function mk(t,x){var e=document.createElement(t);if(x!=null)e.textContent=x;return e;}
function paint(b,on){
  b.setAttribute("aria-pressed",on?"true":"false");
  b.style.setProperty("background",on?"var(--bg-accent)":"transparent","important");
  b.style.setProperty("color",on?"var(--text-accent)":"var(--text-primary)","important");
  b.style.setProperty("border-color",on?"var(--border-accent)":"var(--border-strong)","important");
  b.style.setProperty("font-weight",on?"500":"400","important");
}
function chipRow(box,opts,get,set){
  box.innerHTML="";
  opts.forEach(function(o){
    var b=mk("button");b.type="button";
    var on=get()===o;
    if(on){var ic=mk("i");ic.className="ti ti-check";ic.setAttribute("aria-hidden","true");ic.style.fontSize="14px";b.appendChild(ic);}
    b.appendChild(document.createTextNode(o));
    paint(b,on);
    b.addEventListener("click",function(){set(get()===o?"":o);chipRow(box,opts,get,set);upd();});
    box.appendChild(b);
  });
}
function drawGrid(){
  var gr=g("pwGrid");gr.innerHTML="";
  TPL.forEach(function(t){
    var b=mk("button");b.type="button";
    var ic=mk("i");ic.className="ti ti-"+t.icon;ic.setAttribute("aria-hidden","true");ic.style.fontSize="16px";
    b.appendChild(ic);b.appendChild(document.createTextNode(t.name));
    paint(b,t===cur);
    b.addEventListener("click",function(){cur=t;g("pwErr").textContent="";drawGrid();drawFields();});
    gr.appendChild(b);
  });
  g("pwDesc").textContent=cur.desc;
}
function drawFields(){
  var F=g("pwFields");F.innerHTML="";
  var v=vals[cur.id]||(vals[cur.id]={}),c=picks[cur.id]||(picks[cur.id]={});
  cur.f.forEach(function(f,i){
    var w=mk("div");w.className="pw-f";
    var l=mk(f[1]==="t"?"label":"span",f[0]);if(f[1]!=="t")l.className="pw-lb";
    if(f[3]){var r=mk("span","*");r.className="pw-req";l.appendChild(r);}
    w.appendChild(l);
    if(f[1]==="t"){
      var ta=mk("textarea");ta.id="pwT"+i;ta.rows=1;ta.placeholder=f[2];ta.value=v[i]||"";l.htmlFor=ta.id;
      ta.addEventListener("input",function(){v[i]=ta.value;g("pwErr").textContent="";upd();});
      w.appendChild(ta);
    }else{
      var box=mk("div");box.className="pw-chips";
      chipRow(box,f[2],function(){return c[i]||"";},function(x){c[i]=x;});
      w.appendChild(box);
    }
    F.appendChild(w);
  });
  upd();
}
function compose(){
  var v=vals[cur.id]||{},c=picks[cur.id]||{},o=["<"+cur.tag+">"];
  cur.f.forEach(function(f,i){var x=(f[1]==="t"?(v[i]||"").trim():(c[i]||""))||"없음";o.push(f[0]+": "+x);});
  o.push("</"+cur.tag+">","","<options>","답변 길이: "+len,"</options>","","<planning>",cur.p,"</planning>","",PLAN);
  return o.join("\n");
}
function upd(){g("pwPre").textContent=compose();}
function missing(){var v=vals[cur.id]||{};for(var i=0;i<cur.f.length;i++){var f=cur.f[i];if(f[3]&&!(v[i]||"").trim())return i;}return -1;}
g("pwSend").addEventListener("click",function(){
  var m=missing();
  if(m>=0){g("pwErr").textContent=cur.f[m][0]+" 칸을 먼저 채워주세요";var t=g("pwT"+m);if(t)t.focus();return;}
  if(typeof sendPrompt==="function"){sendPrompt(compose());}else{g("pwErr").textContent="이 화면에서는 바로 보내기가 안 돼요. 미리보기 내용을 복사해서 보내주세요.";}
});
g("pwBuild").addEventListener("click",function(){if(typeof sendPrompt==="function"){sendPrompt(BUILD);}else{g("pwErr").textContent="이 화면에서는 바로 보내기가 안 돼요. \"이제 /만들어\"라고 직접 보내주세요.";}});
g("pwReset").addEventListener("click",function(){vals[cur.id]={};picks[cur.id]={};g("pwErr").textContent="";drawFields();});
chipRow(g("pwLen"),LENS,function(){return len;},function(x){len=x||"보통";});
drawGrid();drawFields();
})();
</script>
```