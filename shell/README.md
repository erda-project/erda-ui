# Terminus PaaS console UI project

## 简介
此项目为Erda的前端工程项目
- 生产环境: https://terminus-org.app.terminus.io/
- 文档: https://docs.terminus.io/dice-docs-3-13/
- 开发文档: https://yuque.antfin-inc.com/terminus_paas_dev/front

## 环境搭建

### nginx 配置
如果要对接和联调后端，则需要使用 nginx

- 若已安装 homebrew, 可以直接 `brew install nginx`，或者至官网下载
- 在默认配置文件(/usr/local/etc/nginx nginx.conf)中http的代码块内添加`include servers/*;`
- 在 servers 目录中新建配置，如 `touch dice.conf`
- 将文件中的root路径改成自己的路径
- 如果出现 `duplicate upstream` 的错误，建议强制stop nginx然后重启。

参考配置如下：
```nginx
upstream dice_server {
  # 远端服务地址
  server 120.55.42.228:80; # dice-dev
  # server 47.99.240.176:80; # dice-test
}

server {
  listen 80; # default_server

  listen 443 ssl;
  ssl_certificate /usr/local/etc/nginx/cert/test/server.crt; # 自行修改，证书文件从语雀文档中下载
  ssl_certificate_key /usr/local/etc/nginx/cert/test/server.key; # 自行修改
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

  server_name dice.dev.terminus.io; # 配合 host 绑定

  # 本地 public 资源路径
  root /Users/path/to/project/public; # 自行修改

  # individual nginx logs for this web vhost
  # 输出日志路径，新建.log 文件给出路径即可
  access_log  /tmp/logs/paas-console-access.log; # 自行修改
  error_log   /tmp/logs/paas-console-error.log; # 自行修改

  #static files
  location ~* ^/static/\w+/scripts/ {
    expires -1;
    add_header 'Cache-Control' 'no-cache';
  }
  location ~* ^/(style|scripts|images|locales|static)/ {
    expires 30d;
  }
  location ~* version\.(json)$ {
      expires -1;
      add_header 'Cache-Control' 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
  }

  # root
  location / {
      index index.html;
      try_files /index.html =404;
  }

  location /api {
      proxy_pass http://dice_server; # 转发地址
      proxy_set_header        X-Real-IP $remote_addr;
      proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header        Host $http_host;
  }

  location ^~ /api/websocket {
    proxy_pass              http://dice_server;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }

  location ^~ /api/repo {
    proxy_pass              http://dice_server;
    proxy_set_header        X-Real-IP $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        Host $host;
  }

}
```

- 配置完成后需要绑定 host 映射以通过域名进行访问 (推荐使用[SwitchHost](http://oldj.github.io/SwitchHosts/)工具进行管理)
- 启动 nginx 服务 `nginx`, 修改 nginx 配置后需要重新加载 `nginx -s reload`, 提示权限错误时请加sudo

### VSCode配置说明
* 必须安装eslint、stylelint、scss-lint、Code Spell Checker
* 推荐安装
  - Code Spell Checker: 单词拼写检查
  - stylelint和scss-lint: 样式文件校验和格式化
  - expand-region: 扩展选择范围
  - Project Manager: 项目管理和切换
  - Scss IntelliSense： scss辅助
  - Sublime Text Keymap: 使用sublime的快捷键
  - Color Highlight: 色值可视化及选择
* 请使用VScode->Preferences->setting，设置

```shell
"eslint.autoFixOnSave": true,
"tslint.autoFixOnSave": true,
"eslint.validate": [
    "javascript",
    "javascriptreact",
    {
      "language": "vue",
      "autoFix": true
    },
    {
      "language": "vue-html",
      "autoFix": true
    },
    {
      "language": "typescript",
      "autoFix": true
    },
    {
      "language": "typescriptreact",
      "autoFix": true
    }
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true,
  },
"[css]": {
    "editor.formatOnSave": true
  },
"[scss]": {
    "editor.formatOnSave": true
  },
```

### 启动
- node v12版本执行 `npm install`
- 开发模式：`npm run dev`
- 不启动 dev-server的开发模式： `npm run watch`
- 打包发布镜像 `npm run release`

**本地run dev需要的dev-server.ignore.js**
```javascript
const devEnv = 'http://terminus-org.dev.terminus.io';
const testEnv = 'http://terminus-org.test.terminus.io';
const prodEnv = 'https://dice.app.terminus.io';


const backendUrl = devEnv;
const frontUrl = `local.${backendUrl.replace(/http(s?):\/\//, '')}`; // local与对应环境根域名一致
const port = 8080;

console.log(`
本地host需要配置：
127.0.0.1  ${frontUrl}
`);

module.exports = {
  backendUrl,
  frontUrl,
  port,
};
```

### 部署
- 登录对应环境机器
- `kubectl get pods` 查看服务
- `kubectl edit pod ui-xxx-xxx` 修改服务，找到对应镜像image，修改后保存


## 开发流程
### 项目结构说明
```javasdript
app: dice-ui目录
  project: 模块名
    common: 该模块内公用组件
    models: dva的model
    stores: cube的store
    pages: 按页面划分
      components: 纯组件
      containers: 容器组件
      使用cube后不需要containers，直接放在pages下即可，components里可以放页面组件
    services: api接口
    types: 领域模型和接口类型定义
    index.js: router配置
monitor: 监控UI目录
```

### 项目开发流程（参考）
1. types中新增领域模型和接口的类型定义
2. services中添加接口
3. 添加对应store
4. index.js添加页面路由
5. pages中新增页面
6. 页面复杂时推荐把页面组件分离到components中

### 使用 snippet（vsCdoe 编辑器可用）
执行 `npm run gen-sni`，会使用 snippets 目录里的配置，在本地创建 .vscode 目录，并生成一些 snippet 文件，可以提高开发速度。
常用的代码块也可以自己添加到 snippets 目录中。

### Commit message格式
`<type>: <subject>`

注意冒号后面有空格。
type 用于说明 commit 的类别，只允许使用下面所列标识：
> - 包括 feat、fix、refactor 在内的其他 type，body 信息选填。

- feat: 新功能
- fix: 缺陷修复
- refactor: 重构（即不是新增功能，也不是修改bug的代码变动）
- docs: 文档（documentation）
- style: 格式（不影响代码运行的变动）
- perf: 性能优化（提升性能的代码变动）
- test: 增加测试
- chore: 构建过程或辅助工具的变动
- revert: 回滚
- WIP: 正在进行中的改动

项目中已引入 [commitizen](https://github.com/commitizen/cz-cli) 工具来生成 commit message，使用方式如下：
>1. 全局装一下 commitizen：`npm i -g commitizen`
>2. 然后使用命令行工具提交 commit，用 `git cz` 命令替换 `git commit` ，按照提示进行选择和填写即可

> ![image-20190327201841668](http://wx4.sinaimg.cn/large/006tKfTcly1g1hmajn5t8j30ra09imyk.jpg)
