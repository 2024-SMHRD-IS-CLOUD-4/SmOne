# Frontend 빌드를 위한 Stage
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Backend Stage
FROM python:3.12-slim
WORKDIR /app

# 필요한 시스템 패키지 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Python 패키지 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Backend 코드 복사
COPY backend/ .

# Frontend 빌드 결과물 복사
COPY --from=frontend-builder /app/frontend/build /app/static

# FastAPI 실행
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]