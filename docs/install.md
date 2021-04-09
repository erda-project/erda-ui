# How to install and deploy

使用 gulp 进行工程的编译和打包，需要 node 环境 >= v6.0.0 。

- 首先全局安装 gulp : `npm i -g gulp` (只需安装一次)
- 安装以及更新工程依赖: 在工程根目录下执行 `npm i`
- 执行编译打包: `gulp build`
- 获取打包结果: 将打包后产生的 `public` 目录整体拷贝到待发布位置
- 配置 nginx 并启动:

  ```nginx
  upstream console_server {
      server serverIp:port; # console server ip and port, 自行修改
  }
  upstream monitor_server {
      server serverIp:port; # monitor server ip and port, 自行修改
  }

  server {
      listen 80;
      server_name paas-console.terminus.io;
      root /Users/anson/Develop/aixforce/pampas-paas/console-ui/public; # 上一步产生的 public 目录，自行修改

      # individual nginx logs for this web vhost
      access_log  /tmp/logs/paas-console-access.log; # 自行修改
      error_log   /tmp/logs/paas-console-error.log; # 自行修改

      location / {
          index index.html;
          try_files /index.html =404;
      }

      location /api {
          proxy_pass http://console_server;
          proxy_set_header        X-Real-IP $remote_addr;
          proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header        Host $http_host;
      }

      location /api/monitor {
          proxy_pass http://monitor_server;
          proxy_set_header        X-Real-IP $remote_addr;
          proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header        Host $http_host;
      }

      location /api/ws {
          proxy_pass http://console_server;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
          proxy_set_header Host $host;
      }

      #static files
      location ~* ^.*\.(map|jpg|jpeg|gif|png|ico|css|zip|tgz|gz|rar|bz2|doc|xls|exe|pdf|ppt|txt|tar|mid|midi|wav|bmp|rtf|js)$ {
          expires 30d;
      }
  }
  ```

  `sudo nginx`
