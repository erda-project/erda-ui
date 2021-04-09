
module.exports = {
  DEV_URL: "https://terminus-org.dev.terminus.io",
  TEST_URL: "https://terminus-org.test.terminus.io",
  SCHEDULER_URL: "http://localhost:3000",
  ERDA_UI_DIR: "/Users/Jun/workspace/erda-ui",
  MODULE_NAME: "shell",
  MODULE_HOST: "local-shell.terminus-org.dev.terminus.io",
  MODULE_PORT: "8080",
  DEV_MODULES: ["shell","admin"],
  PROD_MODULES: ["core"],

  wrapWebpack(webpackConfig) {
    if (process.env.NODE_ENV === 'production') {
      webpackConfig.output.publicPath = '/static/shell/';
    } else {
      webpackConfig.output.publicPath = 'https://local-shell.terminus-org.dev.terminus.io:8080/';
      if (webpackConfig.devServer) {
        console.log(`
add config in host file：
127.0.0.1  local-shell.terminus-org.dev.terminus.io
        `);

        webpackConfig.devServer.host = "local-shell.terminus-org.dev.terminus.io";
        webpackConfig.devServer.port = 8080;
      }
    }
    return webpackConfig;
  }
}

