# -*- coding: utf-8 -*-
import logging
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from inference import test  
from fastapi.responses import JSONResponse


# UTF-8 강제 적용
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s", encoding="utf-8")

logging.info("✅ FastAPI 서버 실행 시작!")

app = FastAPI()

# Java 서버 API 주소
BASE_URL = "http://223.130.157.164:8090/SmOne/api"
LOGIN_URL = f"{BASE_URL}/users/login"
SESSION_DOCTOR_URL = f"{BASE_URL}/users/session/doctor"
SESSION_CHECK_URL = f"{BASE_URL}/users/session-check"

# 세션 객체 생성 (쿠키 유지)
session = requests.Session()

def login_to_java(user_id, user_pw):
    login_data = {"userId": user_id, "userPw": user_pw}  # 사용자가 입력한 값으로 로그인!
    login_response = session.post(LOGIN_URL, json=login_data)

    if login_response.status_code == 200:
        print(f"✅ Java 로그인 성공! userId: {user_id}, 세션 쿠키: {session.cookies.get_dict()}")
    else:
        print(f"❌ Java 로그인 실패: {login_response.text}")
        exit()

# 로그인 요청 모델 정의
class LoginRequest(BaseModel):
    user_id: str
    user_pw: str

@app.post("/java-login")
def java_login(request: LoginRequest):
    """
    Java 서버에 로그인 요청을 보냄
    """
    try:
        login_to_java(request.user_id, request.user_pw)  # 실제 입력값으로 로그인
        response_data = {"message": "Java 로그인 성공", "user_id": request.user_id}
        return JSONResponse(content=response_data, media_type="application/json; charset=utf-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"로그인 실패: {str(e)}")


# Java 로그인 후 세션을 유지하면서 doctor_id 가져오기
def get_doctor_id():
    try:
        # 세션 유지 확인
        session_check = session.get(SESSION_CHECK_URL)
        print("Java 세션 체크 응답:", session_check.text)
        
        if "세션이 만료" in session_check.text:
            raise HTTPException(status_code=401, detail="Java 서버 세션 만료됨.")

        # 로그인 후 세션에서 doctor_id 가져오기
        response = session.get(SESSION_DOCTOR_URL)

        if response.status_code == 200:
            doctor_id = response.json().get("doctor_id")
            if not doctor_id:
                raise HTTPException(status_code=401, detail="Java 서버에서 doctor_id를 찾을 수 없습니다.")
            return doctor_id
        else:
            raise HTTPException(status_code=response.status_code, detail="Java 서버에서 세션값을 가져올 수 없습니다.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Java 서버 요청 실패: {e}")

# doctor_id 확인용 엔드포인트
@app.get("/get-doctor-id")
def fetch_doctor_id():
    doctor_id = get_doctor_id()
    return {"doctor_id": doctor_id}

# CORS 설정 (필요한 도메인만 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #  실제 사용 환경에서는 특정 도메인으로 제한 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic 모델 정의
class DiagnosisRequest(BaseModel):
    p_idx: int
    doctor_id: str

# X-ray 진단 API
@app.post("/diagnose/")
async def diagnose(request: DiagnosisRequest):
    """
    X-ray 진단 API:
    - React에서 받은 p_idx 사용
    - Java 서버에서 doctor_id를 가져오고
    - 모델 실행 및 DB 저장
    """
    try:
        print(f"Received request: {request.model_dump()}")  # 요청 데이터 로그 출력

        # doctor_id 자동 설정 (세션에서 가져오기)
        doctor_id = request.doctor_id if request.doctor_id else get_doctor_id()
        
        if not doctor_id:
            raise HTTPException(status_code=400, detail="doctor_id를 가져올 수 없습니다.")

        print(f"Using doctor_id: {doctor_id}, P_IDX: {request.p_idx}")  # doctor_id, p_idx 확인

        # `test()` 함수 호출 (p_idx, doctor_id 넘기기)
        test(request.p_idx, doctor_id)

        print("✅ Database updated successfully")  # DB 업데이트 확인

        return {
            "status": "success",
            "p_idx": request.p_idx,
            "doctor_id": doctor_id,
            "result": "진단 완료",
        }
    except HTTPException as e:
        print(f"⚠ HTTP Error: {e.detail}")  # HTTP 예외 로그 출력
        raise
    except Exception as e:
        print(f"⚠ Unexpected Error: {str(e)}")  # 일반 예외 로그 출력
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-images")
def get_images(p_idx: int):
    """
    p_idx에 해당하는 X-ray 이미지 경로 가져오기
    """
    print(f"GET /get-images 요청 받음, P_IDX={p_idx}")
    
    query = """
    SELECT IMG_PATH
    FROM XRAY_IMAGES
    WHERE P_IDX = %s
      AND IMG_PATH LIKE 'http%%'
    """
    
    # SQL 실행 (여기서 DB 커넥션을 사용해야 함)
    result = db.execute(query, (p_idx,))
    
    if not result:
        raise HTTPException(status_code=404, detail=f"DB에서 P_IDX {p_idx}에 대한 이미지 경로를 찾을 수 없습니다.")

    print(f"✅ 조회된 결과: {result}")  
    return {"images": result}
