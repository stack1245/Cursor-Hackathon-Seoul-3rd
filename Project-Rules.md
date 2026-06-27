# 🛠 Project-HERMES 팀 협업 및 통합 규칙

## 1. 개발 스택 및 아키텍처 규칙

* **메인 개발 스택:** `React (Next.js 14+ App Router)` 단일 스택 사용.
* **프론트-백 통합:** 기능 구현의 속도를 위해 외부 API 서버를 따로 파지 않고, Next.js의 `Route Handlers (src/app/api/.../route.ts)` 기능을 백엔드로 활용하여 단일 레포지토리 내에서 프론트와 백엔드를 모두 처리합니다.
* **데이터/AI 직군 예외 허용 (파이썬 사용 시):**
* 데이터 전처리 및 Vector DB 파이프라인 구축 담당자가 파이썬 환경이 꼭 필요할 경우, 로컬에 가벼운 **`FastAPI` 사설 서버**를 구동하여 데이터 서빙 API만 제공합니다.
* 프론트엔드는 Next.js API Routes를 거치거나 직접 파이썬 로컬 서버 주소(`http://localhost:8000`)로 `fetch`를 요청해 연동합니다.



---

## 2. Git 브랜치 운용 및 메인 커밋 금지 규칙

* **`main` 브랜치 커밋 절대 금지:** `main` 브랜치는 오직 최종 결과물을 두고 데모 시연을 띄우는 프로덕션 브랜치입니다. 직접적인 Push나 Commit은 엄격히 금지합니다.
* **`develop` 브랜치 활용:** 각자의 기능 브랜치가 완성되면 1차적으로 `develop` 브랜치에 모여 통합 테스트를 진행합니다.
* **개인 기능 브랜치 (`feat/`) 세분화:**
* 프론트엔드 UI/대시보드: `feat/front-ui`
* 백엔드 API 및 LLM 연동: `feat/backend-api`
* 데이터 파이프라인 (파이썬/스크립트): `feat/data-pipeline`



---

## 3. 작업 및 Pull Request (PR) 프로세스

1. **기능 개발:** 각자 할당된 `feat/` 브랜치에서 독립적으로 워크스페이스를 구성해 개발합니다.
2. **최신 코드 싱크 및 충돌 해결:** `develop` 브랜치에 코드를 합치기 전, 반드시 아래 명령어로 최신 코드를 가져와 본인 로컬에서 충돌을 먼저 해결합니다.
```bash
git checkout develop
git pull origin develop
git checkout feat/본인브랜치
git merge develop

```


3. **PR 생성 및 병합:** 충돌이 없는 상태로 원격에 Push 후, `develop` 브랜치를 향해 PR을 생성합니다. 팀원 최소 1명의 승인(컨펌) 후 Merge합니다.
4. **최종 릴리즈:** 발표 1시간 전, `develop`에서 완벽히 작동하는 것을 확인하고 `main` 브랜치로 최종 Merge하여 데모 준비를 마칩니다.

---

## 4. 파일 격리 및 충돌 방지 규칙

같은 파일 수정을 방지하기 위해 파일 레이어와 디렉토리를 완벽히 쪼개서 작업합니다.

* **화면 UI 담당자:** `src/app/dashboard/page.tsx` 및 하위 컴포넌트 파일 전담 수정.
* **백엔드/LLM 담당자:** `src/app/api/analyze/route.ts` 파일 전담 수정.
* **공통 파일 및 설정:** `layout.tsx`나 `globals.css` 등 공통 설정을 건드릴 때는 반드시 메신저나 구두로 사전에 공유하고 진행합니다.

---

## 5. 환경 변수(`.env`) 및 가짜 데이터(Mock) 보안 프로토콜

* **API Key 보안:** Cursor 및 OpenAI API Key 등은 각자 `+.env.local+`에 작성하며, 이 파일은 `+.gitignore+`에 등록하여 GitHub에 절대 노출되지 않도록 합니다.
* **Mock Data 선행:** 백엔드/데이터 파이프라인이 완성되기 전까지 프론트엔드는 미리 합의한 JSON 구조의 가짜 데이터를 만들어 화면 인터페이스를 중단 없이 개발합니다. 최종 통합 시점에 API 주소만 변경합니다.