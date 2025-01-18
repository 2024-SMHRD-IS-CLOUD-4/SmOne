import requests
import os
from dotenv import load_dotenv

def test_db_connection():
    # .env 파일에서 환경변수 로드
    load_dotenv()
    
    # 환경변수에서 DB URL 가져오기
    base_url = os.getenv('REACT_APP_DB_URL')
    
    if not base_url:
        print("Error: REACT_APP_DB_URL not found in environment variables")
        return
    
    # 테스트용 로그인 데이터
    test_data = {
        "userId": "test_user",
        "userPw": "test_password"
    }
    
    try:
        # API 엔드포인트 호출
        login_url = f"{base_url}/users/login"
        print(f"Attempting to connect to: {login_url}")
        
        response = requests.post(
            login_url,
            json=test_data,
            timeout=5  # 5초 타임아웃 설정
        )
        
        # 응답 상태 확인
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Connection successful!")
        else:
            print(f"Connection failed with status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"Connection Error: Could not connect to {base_url}")
    except requests.exceptions.Timeout:
        print("Timeout Error: The request timed out")
    except requests.exceptions.RequestException as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_db_connection()