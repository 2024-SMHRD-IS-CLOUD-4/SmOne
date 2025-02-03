import cv2
import numpy as np
import onnxruntime as ort


def _min_max_normalize(arr:np.ndarray) -> np.ndarray:
    return (arr - arr.min()) / (arr.max() - arr.min())

def _windowing(image, use_median=True, width_param=4.0):
   center = np.median(image) if use_median else image.mean()
   range_half = (image.std() * width_param) / 2.0
   return np.clip(image, center - range_half, center + range_half)

def preprocess(arr:np.ndarray):
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
    image = image.astype(np.float32)
    return image[None, None, ...] # (1, 1, 384, 384)

def load_model() -> ort.InferenceSession:
    model_path = "model.onnx"
    return ort.InferenceSession(model_path)

def inference(arr:np.ndarray, model:ort.InferenceSession):
    image = preprocess(arr)
    input_name = model.get_inputs()[0].name
    output_name = model.get_outputs()[1].name
    result = model.run([output_name], {input_name: image.astype(np.float32)})[0]
    return result



def test():
    arr = np.random.rand(512, 512)
    model = load_model()
    result = inference(arr, model)
    print(result)


if __name__ == "__main__":
    test()
