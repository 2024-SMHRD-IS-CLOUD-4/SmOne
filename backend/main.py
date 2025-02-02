from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# static 파일들을 위한 라우터 설정
app.mount("/static", StaticFiles(directory="static/static"), name="static")
app.mount("/assets", StaticFiles(directory="static"), name="assets")

# index.html을 서빙하기 위한 기본 라우트
@app.get("/")
async def read_index():
    return FileResponse("static/index.html")

@app.get("/{catch_all:path}")
async def catch_all(catch_all: str):
    # API 요청은 별도 처리
    if catch_all.startswith("api/"):
        return {"error": "API endpoint not found"}
    # 그 외 모든 요청은 index.html로 리다이렉트
    return FileResponse("static/index.html")

@app.get("/api/test")
async def test_endpoint():
    return {"status": "OK", "message": "API is working"}