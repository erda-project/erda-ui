const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '~': path.join(__dirname, 'src'),
    },
  },
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  devServer: {
    host: '127.0.0.1',
    port: 3001,
    before: function (app, server, compiler) {
      app.get('/api/user/me', function (req, res) {
        console.log('------', req.query);
        if (req.query.id === '1') {
          res.json({
            data: {
              email: '123@123.com',
              id: '10390',
              nick: '张小俊',
              phone: '15990166143',
            },
          });
        } else {
          res.writeHead(401, { 'Content-Type': 'text/plain' });
          res.end('error');
        }
      });
      app.post('/api/user/registration', function (req, res) {
        let _dataStr = '';
        req.on('data', function (chunk) {
          _dataStr += chunk;
        });
        req.on('end', () => {
          const data = JSON.parse(_dataStr);
          if (data.email === '123@12.com') {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                errorMsg: '邮箱已被注册',
              }),
            );
          } else {
            res.end();
          }
        });
      });
      app.post('/api/user/login', function (req, res) {
        let _dataStr = '';
        req.on('data', function (chunk) {
          _dataStr += chunk;
        });
        req.on('end', () => {
          const data = JSON.parse(_dataStr);
          if (data.email === '123@12.com') {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                errorMsg: '用户名或密码错误',
              }),
            );
          } else {
            res.json({
              data: {
                email: '123@123.com',
                id: '10390',
                nick: '张小俊',
                phone: '15990166143',
              },
            });
          }
        });
      });

      app.post('/api/user/logout', function (req, res) {
        res.end();
      });
    },
  },
};
