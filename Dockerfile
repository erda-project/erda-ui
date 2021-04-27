#!dice
FROM registry.cn-hangzhou.aliyuncs.com/dice-third-party/terminus-nginx:0.2

# Set special timezone
RUN echo "Asia/Shanghai" | tee /etc/timezone

COPY public /app/
WORKDIR /app

COPY public  /use/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/

CMD sed -i "s^server_name .*^^g" /etc/nginx/conf.d/nginx.conf.template && \
    envsubst "`printf '$%s' $(bash -c "compgen -e")`" < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf && \
    /usr/local/openresty/bin/openresty -g 'daemon off;'