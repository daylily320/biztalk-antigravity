# 업무 말투 변환기 — PRD

> **실습 형태**: One Day 프로젝트 
> **문서 목적**: 구현의 완료 기준과 명세를 담은 실행 문서

---

## 목차

1. [바이브 코딩 3원칙](#1-바이브-코딩-3원칙)
2. [완료 체크리스트](#2-완료-체크리스트)
3. [기술 스택](#3-기술-스택)
4. [기능 요구사항](#4-기능-요구사항)
5. [수신 대상별 프롬프트 전략](#5-수신-대상별-프롬프트-전략)
6. [디렉토리 구조](#6-디렉토리-구조)
7. [API 명세](#7-api-명세)
8. [단계별 구현 순서](#8-단계별-구현-순서)
9. [바이브 코딩 프롬프트 예시](#9-바이브-코딩-프롬프트-예시)

---

## 1. 바이브 코딩 3원칙

바이브 코딩의 속도는 살리되, AI에 끌려다니지 않기 위한 핵심 원칙입니다.

---

### 원칙 1. 완료 기준을 먼저 정의하라

**"뭘 만들면 끝인지" 체크리스트를 미리 적어라**

AI도 사람도 "끝"의 기준이 명확해야 헤매지 않습니다. 기준 없이 시작하면 AI는 계속 기능을 추가하고, 하루가 지나도 완성되지 않습니다.

```
✅ 좋은 프롬프트
"오늘 목표는 체크리스트 항목들만 구현하는 거야. 그 외 기능은 추가하지 마."

❌ 나쁜 프롬프트
"업무 말투 변환기 만들어줘."
```

---

### 원칙 2. 조사 먼저, 구현 나중

**5분의 조사가 1시간의 디버깅을 아껴준다**

새로운 라이브러리나 외부 API를 붙이기 전에 방법을 먼저 파악합니다. 특히 외부 API 연동, 패키지 버전, 인증 방식은 반드시 먼저 확인합니다.

```
✅ 좋은 순서
1단계: "Solar-Pro3 연동 방법 먼저 알려줘. 코드는 아직 짜지 말고."
2단계: 방법 이해 후 → "이제 그 방법으로 구현해줘."

❌ 나쁜 순서
바로: "Solar-Pro3 연동 코드 짜줘."
→ 구버전 API, 잘못된 패키지로 1시간 디버깅 시작
```

---

### 원칙 3. 버그는 분석 먼저, 수정 나중

**"원인부터 알려줘"가 근본 해결로 이어진다**

에러 메시지를 그냥 복붙하면 AI가 임의로 코드를 수정하고, 고쳐지는 것 같다가 다른 에러가 생기는 악순환이 시작됩니다.

```
✅ 좋은 대응
"이 에러가 왜 발생하는지 원인을 먼저 설명해줘.
 수정은 원인 파악 후에 같이 진행하자."

❌ 나쁜 대응
[에러 메시지 복붙]
→ AI 임의 수정 → 다른 에러 발생 → 코드 누더기
```

---

## 2. 완료 체크리스트

아래 항목을 모두 체크할 수 있으면 오늘 실습은 완성입니다.

### 백엔드

- [ ] FastAPI 서버가 로컬에서 정상 실행된다 (`uvicorn main:app`)
- [ ] Health Check 기능이 존재해야 한다
- [ ] `POST /api/convert` 엔드포인트가 존재한다
- [ ] Upstage Solar-Pro3 API 호출이 정상 작동한다
- [ ] 수신 대상(4종)에 따라 다른 프롬프트가 적용된다
- [ ] CORS 설정이 되어 있어 프론트엔드에서 호출 가능하다
- [ ] `.env` 파일로 API 키를 관리하고, `.gitignore`에 등록되어 있다
- [ ] FastAPI 서버에 Staic Page(`index.html`) 라우팅 기능이 있어야 한다
- [ ] Swagger UI(/docs)를 통해 API 문서를 브라우저에서 확인할 수 있다

### 프론트엔드

- [ ] 텍스트 입력창이 있다
- [ ] 수신 대상 선택 버튼이 있다 (4종)
- [ ] [변환하기] 버튼 클릭 시 API를 호출한다
- [ ] 처리 중 로딩 표시가 나타난다
- [ ] 변환 결과가 화면에 출력된다
- [ ] [복사하기] 버튼이 작동한다

### 배포

- [ ] GitHub 레포지토리에 코드가 올라가 있다
- [ ] Vercel 에 프론트엔드와 백엔드를 같이 배포한다
- [ ] Vercel에서 프론트엔드가 정상 접속된다
- [ ] 배포된 URL에서 실제 변환이 작동한다

---

## 3. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프론트엔드 | HTML5 / CSS3 / JavaScript (ES6+) | 프레임워크 없음 |
| 백엔드 | Python 3.11+ / FastAPI / Uvicorn | |
| AI 연동 | 최신 langchain / langchain-upstage | |
| AI 모델 | Upstage Solar-Pro3 | |
| 환경 변수 | python-dotenv | `.env` 파일 관리 |
| 버전 관리 | Git / GitHub | |
| 배포 | Vercel | 프론트엔드와 백엔드 배포 |

### 사전 준비

```bash
# Python 버전 확인 (3.11 이상)
python --version

# 패키지 설치
pip install fastapi uvicorn langchain python-dotenv langchain-upstage

# Git 설치 확인
git --version
```

### .env 파일 구성

```bash
# .env
UPSTAGE_API_KEY=your_api_key_here
```

> ⚠️ `.env` 파일은 절대 GitHub에 올리지 않습니다. `.gitignore`에 반드시 추가하세요.

---

## 4. 기능 요구사항

### 필수 기능 (오늘 구현)

| ID | 기능 | 설명 |
|----|------|------|
| F-01 | 텍스트 입력 | 사용자가 변환할 원문을 자유롭게 입력 |
| F-02 | 수신 대상 선택 | 상사 / 타팀 동료 / 고객 / 팀 내 동료 중 선택 |
| F-03 | 말투 변환 처리 | FastAPI → LangChain → Solar-Pro3 호출 |
| F-04 | 결과 출력 | 변환된 텍스트를 화면에 표시 |
| F-05 | 로딩 표시 | API 호출 중 처리 중 상태 표시 |
| F-06 | 결과 복사 | 변환 결과를 클립보드에 복사 |

### 제외 기능 (오늘 구현하지 않음)

| 기능 | 제외 이유 |
|------|-----------|
| 로그인 / 회원 기능 | One Day 범위 초과 |
| 변환 이력 저장 | DB 구성 필요 |
| 디자인 고도화 | 핵심 기능 우선 |
| 에러 재시도 로직 | 복잡도 증가 |

---

## 5. 수신 대상별 프롬프트 전략

| 대상 코드 | 대상 | 시스템 프롬프트 방향 |
|-----------|------|---------------------|
| `boss` | 상사 / 임원 | 격식 있는 경어체, 공손하고 간결하게 |
| `colleague` | 타팀 동료 | 정중하되 협조적인 업무 어조 |
| `client` | 고객 / 외부 | 친절하고 신뢰감을 주는 서비스 어조 |
| `team` | 팀 내 동료 | 간결하고 실무적인 어조 |

### 프롬프트 템플릿 예시

```python
# templates.py
PROMPTS = {
    "boss": "당신은 비즈니스 문서 작성 전문가입니다. "
            "아래 내용을 상사에게 보내는 격식 있고 공손한 업무 메시지로 변환해주세요.",
    "colleague": "당신은 비즈니스 문서 작성 전문가입니다. "
                 "아래 내용을 타팀 동료에게 보내는 정중하고 협조적인 업무 메시지로 변환해주세요.",
    "client": "당신은 비즈니스 문서 작성 전문가입니다. "
              "아래 내용을 고객에게 보내는 친절하고 신뢰감 있는 서비스 메시지로 변환해주세요.",
    "team": "당신은 비즈니스 문서 작성 전문가입니다. "
            "아래 내용을 팀 내 동료에게 보내는 간결하고 실무적인 메시지로 변환해주세요.",
}
```

---

## 6. 디렉토리 구조

```
biztalk_antigravity/
│
├── backend/
│   ├── main.py                 # FastAPI 앱 + CORS 설정
│   ├── routers/
│   │   └── convert.py          # /api/convert 라우터
│   ├── services/
│   │   └── tone_converter.py   # LangChain + Solar-Pro3 연동
│   ├── prompts/
│   │   └── templates.py        # 대상별 프롬프트 템플릿
│   ├── models/
│   │   └── schemas.py          # Pydantic 요청/응답 스키마
│   ├── .env                    # API 키 (git 제외)
│   ├── .env.example            # 환경 변수 샘플 (git 포함)
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── .env                    # API 키 (git 제외)
├── .gitignore
└── PRD_업무말투변환기.md
```

---

## 7. API 명세

### POST /api/convert

#### 요청

```http
POST /api/convert
Content-Type: application/json
```

```json
{
  "text": "내일까지 보고서 제출 어려울 것 같음",
  "target_audience": "boss"
}
```

| 필드 | 타입 | 필수 | 허용값 |
|------|------|------|--------|
| `text` | string | ✅ | 1자 이상 |
| `target_audience` | string | ✅ | `boss` / `colleague` / `client` / `team` |

#### 응답 — 성공 200 OK

```json
{
  "converted_text": "안녕하세요. 보고서 제출 일정과 관련하여 말씀드립니다. 예상치 못한 사정으로 내일까지 제출이 어려울 것 같습니다. 일정 조율이 가능하신지 여쭤봐도 될까요?",
  "target_audience": "boss",
  "original_text": "내일까지 보고서 제출 어려울 것 같음"
}
```

#### 응답 — 오류 422

```json
{ "detail": "text 필드는 필수입니다." }
```

#### 응답 — 오류 500

```json
{ "detail": "LLM API 호출 중 오류가 발생했습니다." }
```

### GET /health

```json
{ "status": "ok" }
```

### API 문서 (Swagger UI)

FastAPI는 Swagger UI를 기본 제공하므로 서버가 기동 중인 상태에서 아래 주소로 접속해 인터랙티브한 API 문서 및 테스트 환경을 사용할 수 있습니다.

- **Swagger UI 주소**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 8. 단계별 구현 순서

### [ ] STEP 1. 환경 준비

1. GitHub 레포지토리 생성 (`biztalk_antigravity`)
2. 디렉토리 구조 생성
3. `.gitignore` 작성 — `.env` 반드시 포함
4. Upstage API 키 발급 및 `.env` 파일 작성
5. `requirements.txt` 작성하고 의존성의 버전(use context7)을 명시해야 함
6. 가상환경(`venv`) 폴더를 생성하고 `requirements.txt` 명시된 의존성을 가상환경에 설치해야 함

---

### [ ] STEP 2. 백엔드 구현 

> 원칙 2 적용: 구현 전 Solar-Pro3 연동 방식을 먼저 확인하세요.

**구현 순서**

1. `schemas.py` — 데이터 모델 정의(요청/응답 데이터 모델 정의)
2. `templates.py` — 프롬프트 템플릿 작성(수신 대상별 프롬프트 템플릿 작성)
3. `tone_converter.py` — 핵심 변환 로직 구현(LangChain + Solar-Pro2 연동)
4. `convert.py` — API 라우터 구현
5. `main.py` — 메인 앱 설정(FastAPI 앱 + CORS 설정)
6. 로컬 서버 실행 및 테스트 (`uvicorn main:app --reload`)

**핵심 코드 구조 참고**

```python
# schemas.py
from pydantic import BaseModel

class ConvertRequest(BaseModel):
    text: str
    target_audience: str  # boss / colleague / client / team

class ConvertResponse(BaseModel):
    converted_text: str
    target_audience: str
    original_text: str
```

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import convert

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포 시 실제 도메인으로 변경
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert.router, prefix="/api")
```

---

### [ ] STEP 3. 프론트엔드 구현

**구현 순서**

1. `index.html` — HTML 구조 설계(화면 레이아웃 작성)
2. `style.css` — CSS 스타일링(기본 스타일 적용)
3. `app.js` — JavaScript 기능 구현(버튼 이벤트 + API 호출 + 결과 출력)
4. 브라우저 테스트

**핵심 JS 구조 참고**

```javascript
// app.js
const API_BASE = "http://localhost:8000"; // 배포 시 실제 URL로 변경

async function convertTone() {
    const text = document.getElementById("inputText").value;
    const target = document.querySelector(".target-btn.active")?.dataset.target;

    if (!text || !target) {
        alert("내용을 입력하고 수신 대상을 선택해주세요.");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/convert`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, target_audience: target }),
        });

        const data = await response.json();
        document.getElementById("outputText").value = data.converted_text;

    } catch (error) {
        alert("변환 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
        setLoading(false);
    }
}
```

---

### [ ] STEP 4. 배포

> 배포 전 셀프 체크: 프론트엔드 → 백엔드 → LLM의 흐름을 말로 설명할 수 있는가?

1. GitHub에 전체 코드 푸시
2. Vercel에서 `frontend/` 디렉토리 연결
3. `app.js`의 `API_BASE`를 실제 백엔드 URL로 수정
4. 배포 후 실제 URL에서 동작 확인

---

## 9. 바이브 코딩 프롬프트 예시

### 환경 파악 (원칙 2)

```
Upstage Solar-Pro3를 LangChain으로 연동하는 최신 방법을 알려줘.
어떤 패키지를 설치해야 하고, ChatUpstage 클래스는 어떻게 사용하는지
코드 없이 방법만 먼저 설명해줘.
```

### 백엔드 구현 요청 (원칙 1)

```
아래 조건에 맞는 FastAPI 백엔드를 만들어줘.

[완료 조건]
- POST /api/convert 엔드포인트
- 요청: { text: string, target_audience: string }
- 응답: { converted_text: string, target_audience: string, original_text: string }
- target_audience는 boss / colleague / client / team 4종
- 각 대상마다 다른 시스템 프롬프트 적용
- Upstage Solar-Pro3 API 사용
- .env에서 UPSTAGE_API_KEY 로드
- CORS 허용

[하지 말 것]
- 로그인, 인증 기능
- DB 저장
- 위 조건 외 추가 기능
```

### 버그 대응 (원칙 3)

```
아래 에러가 발생했어.
수정하기 전에 왜 이 에러가 발생하는지 원인을 먼저 설명해줘.

[에러 메시지]
CORS policy: No 'Access-Control-Allow-Origin' header is present
```

### 프론트엔드 수정 요청

```
index.html에서 수신 대상 버튼을 클릭하면 active 클래스가 토글 되도록 해줘.
한 번에 하나만 선택되어야 하고,
선택된 버튼은 배경색이 파란색으로 바뀌어야 해.
CSS도 같이 수정해줘.
```

---

## 부록. 배포 참고

### .gitignore 필수 항목

```
.env
__pycache__/
*.pyc
.DS_Store
node_modules/
```

### requirements.txt

```
fastapi
uvicorn
langchain
langchain-upstage
python-dotenv
pydantic
```

### 로컬 실행 명령어

```bash
# 백엔드 실행
cd backend
uvicorn main:app --reload --port 8000

# 프론트엔드 확인
# frontend/index.html을 브라우저에서 직접 열거나 VS Code Live Server 사용
```

### Vercel 배포 설정

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

> 다음 단계: 이 PRD를 완성한 뒤에는 로그인, 이력 저장 등 추가 기능을 붙여보세요.
> 오늘 만든 구조가 그 출발점이 됩니다.