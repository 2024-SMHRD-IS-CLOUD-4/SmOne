import cv2
import numpy as np
import onnxruntime as ort
import pymysql
import os
import requests
import pymysql


TEMP_IMAGE_PATH = "temp_image.png"



def get_db_connection():
    return pymysql.connect(
        host="project-db-cgi.smhrd.com",
        user="campus_24IS_CLOUD_p3_3",
        password="smhrd3",
        database="campus_24IS_CLOUD_p3_3",
        port=3307
    )

def get_image_path(p_idx):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT IMG_PATH
        FROM XRAY_IMAGES
        WHERE P_IDX = %s
          AND IMG_PATH LIKE 'http%%'
    """
    

    print(f"Executing query: {query} with P_IDX = {p_idx}")

    try:
        cursor.execute(query, (p_idx,)) 
        result = cursor.fetchone()
    except Exception as e:
        print(f"Error during query execution: {e}")
        result = None
    finally:
        conn.close()


    return result[0] if result else None


# 웹 URL 또는 로컬에서 이미지 로드
def load_image_from_db(p_idx):
    image_url = get_image_path(p_idx)
    if image_url:
        if image_url.startswith("http"):
            response = requests.get(image_url, stream=True)
            if response.status_code == 200:
                with open(TEMP_IMAGE_PATH, "wb") as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                try:
                    image = cv2.imread(TEMP_IMAGE_PATH, cv2.IMREAD_GRAYSCALE)
                    if image is None:
                        raise ValueError(f"OpenCV가 이미지를 읽을 수 없습니다: {TEMP_IMAGE_PATH}")
                    return image
                finally:
                    os.remove(TEMP_IMAGE_PATH)
            else:
                raise FileNotFoundError(f"웹에서 이미지를 다운로드할 수 없습니다: {image_url}")
        else:
            image = cv2.imread(image_url, cv2.IMREAD_GRAYSCALE)
            if image is None:
                raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {image_url}")
            return image
    else:
        raise FileNotFoundError(f"DB에서 P_IDX {p_idx}에 대한 이미지 경로를 찾을 수 없습니다.")

# 이미지 전처리 함수
def _min_max_normalize(arr: np.ndarray) -> np.ndarray:
    return (arr - arr.min()) / (arr.max() - arr.min())

def _windowing(image, use_median=True, width_param=4.0):
    center = np.median(image) if use_median else image.mean()
    range_half = (image.std() * width_param) / 2.0
    return np.clip(image, center - range_half, center + range_half)

def preprocess(arr: np.ndarray):
    image = _min_max_normalize(arr)
    image = _windowing(image)
    image = _min_max_normalize(image)
    image = cv2.resize(image, (384, 384))

    # 3차원이면 gray scale로 변경
    if len(image.shape) == 3 and image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # 3차원이면서 channle = 1이면 squeeze
    if len(image.shape) == 3 and image.shape[2] == 1:
        image = np.squeeze(image)

    assert len(image.shape) == 2, f"image shape must be 2, but {image.shape}"
    return image[None, None, ...]  # (1, 1, 384, 384)

def load_model() -> ort.InferenceSession:
    model_path = "model.onnx"
    return ort.InferenceSession(model_path)

def inference(arr:np.ndarray, model:ort.InferenceSession):
    image = preprocess(arr)
    input_name = model.get_inputs()[0].name
    output_name = model.get_outputs()[1].name
    result = model.run([output_name], {input_name: image.astype(np.float32)})[0]
    return result

# 처리 상태 업데이트 -> 한번 처리된 이미지 다신 안불러오게 하기! >> 근데 아직 여러개의 이미지가 없어서 위에 쿼리문에서는 조건문에 안넣어놨음
def update_processed_at(p_idx):
    conn = pymysql.connect(
        host="project-db-cgi.smhrd.com",
        user="campus_24IS_CLOUD_p3_3",
        password="smhrd3",
        database="campus_24IS_CLOUD_p3_3",
        port=3307
    )
    cursor = conn.cursor()
    query = """
        UPDATE XRAY_IMAGES
        SET PROCESSED_AT = NOW()
        WHERE P_IDX = %s
    """
    cursor.execute(query, (p_idx,))
    conn.commit()
    conn.close()
    
def get_img_idx(p_idx):
    conn = pymysql.connect(
    host="project-db-cgi.smhrd.com",
    user="campus_24IS_CLOUD_p3_3",
    password="smhrd3",
    database="campus_24IS_CLOUD_p3_3",
    port=3307
    )
    cursor = conn.cursor()
    
    # 임시 쿼리문
    query = """
        SELECT IMG_IDX FROM XRAY_IMAGES WHERE P_IDX = %s
    """
    
    try : 
        cursor.execute(query, (p_idx,))
        result = cursor.fetchone()
        return result[0] if result else None
    except Exception as e :
        print(f"img_idx 조회 중 오류 발생 : {e}")
        return None
    finally : 
        conn.close()
    
def get_result(result):
    labels = ["TB" , "PNEUMONIA" , "NORMAL" , "OTHER"]
    
    print("Raw output:", result[0])  # 예측된 확률값 출력
    max_index = result[0].argmax()
    
    print(f"Predicted label: {labels[max_index]}, Confidence: {result[0][max_index]:.4f}")
    return labels[max_index]

def save_result(p_idx, diagnosis_name, doctor_id, img_idx):
    conn = pymysql.connect(
    host="project-db-cgi.smhrd.com",
    user="campus_24IS_CLOUD_p3_3",
    password="smhrd3",
    database="campus_24IS_CLOUD_p3_3",
    port=3307
    )
    cursor = conn.cursor()
    
    query = """
        INSERT INTO DIAGNOSIS_RESULT (IMG_IDX, DIAGNOSIS, DOCTOR_ID, P_IDX, DIAGNOSED_AT)
        VALUES (%s, %s, %s, %s, NOW())
    """
    
    try :
        cursor.execute(query, (img_idx, diagnosis_name, doctor_id, p_idx))
        conn.commit()
        print('진단 결과가 성공적으로 DB에 저장되었습니다.')
    except Exception as e :
        print(f"DB 저장 중 오류 발생 : {e}")
    finally :
        conn.close()

def test(doctor_id ,p_idx):
    """
    - DB에서 이미지 가져오기
    - 모델 실행하여 결과 생성
    - 결과를 DB에 저장 후 FastAPI에 반환
    """

    if not doctor_id:
        print(f"⚠ ERROR: doctor_id가 None입니다. P_IDX={p_idx}")
        return

    # 이미지 로드 및 모델 추론
    arr = load_image_from_db(p_idx)
    model = load_model()
    result = inference(arr, model)
    print(f"이미지 경로 : {get_image_path(p_idx)}")

    # 진단 결과 이름 가져오기
    diagnosis_name = get_result(result)
    print(f"결과 : {diagnosis_name}")

    # IMG_IDX 가져오기
    img_idx = get_img_idx(p_idx)
    if img_idx is None:
        print(f"⚠ ERROR: IMG_IDX를 찾을 수 없습니다. P_IDX={p_idx}")
        return
    else:
        print(f"✅ IMG_IDX: {img_idx} (P_IDX={p_idx})")

    # DB 저장 (doctor_id가 None이 아닌지 재확인)
    if doctor_id:
        print(f"Saving result: IMG_IDX={img_idx}, DIAGNOSIS={diagnosis_name}, DOCTOR_ID={doctor_id}, P_IDX={p_idx}")
        save_result(p_idx, diagnosis_name, doctor_id, img_idx)
    else:
        print(f"❌ ERROR: doctor_id가 None이므로 DB에 저장할 수 없습니다. P_IDX={p_idx}")

    # 처리 상태 업데이트
    update_processed_at(p_idx)
    
    return {
        "p_idx": p_idx,
        "doctor_id": doctor_id,
        "diagnosis": diagnosis_name
         }

if __name__ == "__main__":
    test()
