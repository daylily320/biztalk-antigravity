import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.routers import convert

app = FastAPI(title="BizTalk Antigravity API", version="1.0.0")

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포 시 실제 도메인으로 조정
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록 (CORS 설정 뒤에 등록하여 미들웨어가 적용되도록 함)
app.include_router(convert.router, prefix="/api")

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# 정적 파일(프론트엔드) 서빙을 위한 경로 계산
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
frontend_dir = os.path.join(parent_dir, "frontend")

# 루트('/') 경로 접속 시 frontend/index.html 반환
@app.get("/")
async def read_index():
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "frontend/index.html not found. Please create it."}

# CSS, JS 등의 리소스를 직접 마운트하여 /css/style.css, /js/app.js 등으로 접근 가능하도록 처리
# (Vercel 배포나 로컬 실행 환경에서 편리한 Static Page 서빙을 지원하기 위함)
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
