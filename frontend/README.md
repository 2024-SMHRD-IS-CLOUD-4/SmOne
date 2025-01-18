# Frontend

## build react in cloud server

    cd /home/uran/frontend
    npm install ( optional package.json이 수정되었다면 )
    npm run build
    # 빌드 완료 되었다면
    sudo systemctl restart httpd ( Apache 재시작 )
     