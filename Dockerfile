#!dice
FROM registry.cn-hangzhou.aliyuncs.com/terminus/terminus-nodejs:npm-6.4.1 AS builder

COPY . /app/
RUN cd /app && npm ci
WORKDIR /app
RUN npm run build

FROM registry.cn-hangzhou.aliyuncs.com/terminus/terminus-nginx:0.2

# Set special timezone
RUN echo "Asia/Shanghai" | tee /etc/timezone

COPY --from=builder /app/public  /usr/share/nginx/html
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY nginx.conf.template /etc/nginx/conf.d/nginx.conf.template

CMD sed -i "s^server_name .*^^g" /etc/nginx/conf.d/nginx.conf.template && \
    envsubst "`printf '$%s' $(bash -c "compgen -e")`" < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf && \
    /usr/local/openresty/bin/openresty -g 'daemon off;'