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

# ??Java ?ë² API ì£¼ì
BASE_URL = "http://localhost:8090/SmOne/api"
LOGIN_URL = f"{BASE_URL}/users/login"
SESSION_DOCTOR_URL = f"{BASE_URL}/users/session/doctor"
SESSION_CHECK_URL = f"{BASE_URL}/users/session-check"

# ???¸ì ê°ì²´ ?ì± (ì¿ í¤ ? ì?)
session = requests.Session()

def login_to_java(user_id, user_pw):
    login_data = {"userId": user_id, "userPw": user_pw}  # ?¬ì©?ê? ?ë ¥??ê°ì¼ë¡?ë¡ê·¸??
    login_response = session.post(LOGIN_URL, json=login_data)

    if login_response.status_code == 200:
        print(f"??Java ë¡ê·¸???±ê³µ! userId: {user_id}, ?¸ì ì¿ í¤: {session.cookies.get_dict()}")
    else:
        print(f"??Java ë¡ê·¸???¤í¨: {login_response.text}")
        exit()

# ??ë¡ê·¸???ì²­ ëª¨ë¸ ?ì
class LoginRequest(BaseModel):
    user_id: str
    user_pw: str

@app.post("/java-login")
def java_login(request: LoginRequest):
    """
    Java ?ë²??ë¡ê·¸???ì²­??ë³´ë
    """
    try:
        login_to_java(request.user_id, request.user_pw)  # ?¥ ?¤ì  ?ë ¥ê°ì¼ë¡?ë¡ê·¸??
        response_data = {"message": "Java ë¡ê·¸???±ê³µ", "user_id": request.user_id}
        return JSONResponse(content=response_data, media_type="application/json; charset=utf-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ë¡ê·¸???¤í¨: {str(e)}")


# ??Java ë¡ê·¸?????¸ì??? ì??ë©´??doctor_id ê°?¸ì¤ê¸?
def get_doctor_id():
    try:
        # ?¸ì ? ì? ?ì¸
        session_check = session.get(SESSION_CHECK_URL)
        print("? Java ?¸ì ì²´í¬ ?ëµ:", session_check.text)
        
        if "?¸ì??ë§ë£" in session_check.text:
            raise HTTPException(status_code=401, detail="Java ?ë² ?¸ì ë§ë£??")

        # ë¡ê·¸?????¸ì?ì doctor_id ê°?¸ì¤ê¸?
        response = session.get(SESSION_DOCTOR_URL)

        if response.status_code == 200:
            doctor_id = response.json().get("doctor_id")
            if not doctor_id:
                raise HTTPException(status_code=401, detail="Java ?ë²?ì doctor_idë¥?ì°¾ì ???ìµ?ë¤.")
            return doctor_id
        else:
            raise HTTPException(status_code=response.status_code, detail="Java ?ë²?ì ?¸ìê°ì ê°?¸ì¬ ???ìµ?ë¤.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Java ?ë² ?ì²­ ?¤í¨: {e}")

# ??doctor_id ?ì¸???ë?¬ì¸??
@app.get("/get-doctor-id")
def fetch_doctor_id():
    doctor_id = get_doctor_id()
    return {"doctor_id": doctor_id}

# ??CORS ?¤ì  (?ì???ë©?¸ë§ ?ì©)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #  ?¤ì  ?¬ì© ?ê²½?ì???¹ì  ?ë©?¸ì¼ë¡??í ê¶ì¥
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ??Pydantic ëª¨ë¸ ?ì
class DiagnosisRequest(BaseModel):
    p_idx: int
    doctor_id: str

# ??X-ray ì§ë¨ API
@app.post("/diagnose/")
async def diagnose(request: DiagnosisRequest):
    """
    X-ray ì§ë¨ API:
    - React?ì ë°ì? p_idx ?¬ì©
    - Java ?ë²?ì doctor_idë¥?ê°?¸ì¤ê³?
    - ëª¨ë¸ ?¤í ë°?DB ???
    """
    try:
        print(f"?¥ Received request: {request.model_dump()}")  # ?ì²­ ?°ì´??ë¡ê·¸ ì¶ë ¥

        # ??doctor_id ?ë ?¤ì  (?¸ì?ì ê°?¸ì¤ê¸?
        doctor_id = request.doctor_id if request.doctor_id else get_doctor_id()
        
        if not doctor_id:
            raise HTTPException(status_code=400, detail="doctor_idë¥?ê°?¸ì¬ ???ìµ?ë¤.")

        print(f"?¤ Using doctor_id: {doctor_id}, P_IDX: {request.p_idx}")  # doctor_id, p_idx ?ì¸

        # ??`test()` ?¨ì ?¸ì¶ (p_idx, doctor_id ?ê¸°ê¸?
        test(request.p_idx, doctor_id)

        print("??Database updated successfully")  # DB ?ë°?´í¸ ?ì¸

        return {
            "status": "success",
            "p_idx": request.p_idx,
            "doctor_id": doctor_id,
            "result": "ì§ë¨ ?ë£",
        }
    except HTTPException as e:
        print(f"??HTTP Error: {e.detail}")  # HTTP ?ì¸ ë¡ê·¸ ì¶ë ¥
        raise
    except Exception as e:
        print(f"??Unexpected Error: {str(e)}")  # ?¼ë° ?ì¸ ë¡ê·¸ ì¶ë ¥
        raise HTTPException(status_code=500, detail=str(e))
