
docker build -t myapp:latest . && docker run -d -p 8000:8000 --name myapp-container myapp:latest

docker logs myapp-container


--- 


docker kill myapp-container && docker rm myapp-container


docker exec -it myapp-container ls -la /app/static