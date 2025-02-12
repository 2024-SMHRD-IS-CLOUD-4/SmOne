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
   
# 결과 저장값 
def convert_diagnosis(diagnosis):
    mapping = {
        "TB": "결핵",
        "PNEUMONIA": "폐렴",
        "NORMAL": "정상",
        "OTHER": "other"
    }
    return mapping.get(diagnosis, "unknown")

def get_image_path(p_idx):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT IMG_PATH
        FROM XRAY_IMAGES
        WHERE P_IDX = %s
          AND IMG_PATH LIKE 'http%%'
          AND PROCESSED_AT IS NULL 
        ORDER BY IMG_IDX DESC
        LIMIT 1
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
def load_image_from_db(img_idx):
    """
    IMG_IDX를 사용해 DB에서 이미지 경로를 가져와 로컬에 다운로드한 후 반환
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT IMG_PATH
        FROM XRAY_IMAGES
        WHERE IMG_IDX = %s
    """

    try:
        cursor.execute(query, (img_idx,))
        result = cursor.fetchone()
        if not result:
            raise FileNotFoundError(f"DB에서 IMG_IDX={img_idx}에 대한 경로를 찾을 수 없습니다.")
        image_url = result[0]

        # 웹 URL에서 이미지 다운로드
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
            # 로컬 경로에서 이미지 로드
            image = cv2.imread(image_url, cv2.IMREAD_GRAYSCALE)
            if image is None:
                raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {image_url}")
            return image
    except Exception as e:
        print(f"⚠ ERROR: IMG_IDX={img_idx}에 대한 이미지 로드 중 오류 발생: {e}")
        return None
    finally:
        conn.close()

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
def update_processed_at(img_idx):
    """
    IMG_IDX를 기준으로 처리 완료 상태 업데이트
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        UPDATE XRAY_IMAGES
        SET PROCESSED_AT = NOW()
        WHERE IMG_IDX = %s
    """

    try:
        cursor.execute(query, (img_idx,))
        conn.commit()
    except Exception as e:
        print(f"⚠ ERROR: IMG_IDX={img_idx} 처리 상태 업데이트 중 오류 발생: {e}")
    finally:
        conn.close()
        
def get_img_idx(p_idx):
    """
    P_IDX에 해당하는 처리되지 않은 IMG_IDX 리스트 반환
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT IMG_IDX
        FROM XRAY_IMAGES
        WHERE P_IDX = %s
          AND PROCESSED_AT IS NULL
    """
    
    try:
        cursor.execute(query, (p_idx,))
        results = cursor.fetchall()  # 처리되지 않은 모든 IMG_IDX 가져오기
        return [row[0] for row in results]  # IMG_IDX 리스트로 반환
    except Exception as e:
        print(f"⚠ ERROR: img_idx 조회 중 오류 발생: {e}")
        return []
    finally:
        conn.close()

def get_result(result):
    labels = ["TB" , "PNEUMONIA" , "NORMAL" , "OTHER"]
    
    print("Raw output:", result[0])  # 예측된 확률값 출력
    max_index = result[0].argmax()
    
    print(f"Predicted label: {labels[max_index]}, Confidence: {result[0][max_index]:.4f}")
    return labels[max_index]

def test(doctor_id, p_idx):
    """
    P_IDX에 해당하는 처리되지 않은 모든 이미지를 처리
    """
    
    if not doctor_id:
        print(f"⚠ ERROR: doctor_id가 None입니다. P_IDX={p_idx}")
        return []

    # 처리되지 않은 IMG_IDX 리스트 가져오기
    img_ids = get_img_idx(p_idx)
    if not img_ids:
        print(f"⚠ ERROR: P_IDX={p_idx}에 대한 처리할 이미지가 없습니다.")
        return[]

    # 모델 로드
    model = load_model()
    results = []

    # IMG_IDX 리스트 반복 처리
    for img_idx in img_ids:
        print(f"Processing IMG_IDX={img_idx}")

        try:
            # 이미지 로드
            arr = load_image_from_db(img_idx)
            if arr is None:
                print(f"⚠ ERROR: IMG_IDX={img_idx}에 대한 이미지를 로드할 수 없습니다.")
                continue

            # 모델 추론
            inference_result = inference(arr, model)
            
            # 결과 데이터 정리
            diagnosis_name = get_result(inference_result)
            confidence = float(max(inference_result[0]))  # 신뢰도 값 추가

            # 결과 저장
            update_processed_at(img_idx)

            # 🚀 결과 리스트에 저장
            results.append({
                "img_idx": img_idx,
                "diagnosis": diagnosis_name,
                "confidence": confidence
            })
        except Exception as e:
            print(f"⚠ ERROR: IMG_IDX={img_idx} 처리 중 오류 발생: {e}")
            continue

    print(f"✅ P_IDX={p_idx}에 대한 모든 이미지 처리 완료.")
    
    return results

if __name__ == "__main__":
    test()