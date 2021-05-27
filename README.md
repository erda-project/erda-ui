# Frontend UI for Erda platform.

<div>
  <img src="./docs/files/logo.jpg" alt="logo" width="350">
</div>

[![codecov](https://codecov.io/gh/erda-project/erda-ui/branch/develop/graph/badge.svg)](https://codecov.io/gh/erda-project/erda-ui)

## 📣 Introduction
Erda is an open-source platform created by Terminus to ensuring the development of microservice applications.
This repository is about Erda's User Interface.

## ✨ Platforms

- DevOps platform
- Microservice Governance platform
- Multi-Cloud Management platform
- Edge computing platform
- Fast-Data platform(open source soon)

For a detailed introduction, please check the [official website](https://www.erda.cloud).


## 🖥 Environment Support

Modern browsers

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Edge |
| --- | --- | --- | --- |
| last 2 versions | last 2 versions | last 2 versions | last 2 versions |

## 🚀 Quick Start
### Usage

Welcome to use [Erda Cloud](https://erda.cloud)

### Installation

Please follow How to install Erda.

* [installation document](https://github.com/erda-project/erda/blob/9c904121313821d2b9f7ba15eeebb9286216c4a5/docs/guides/deploy/How-to-install-the-Erda.md)

### Run Erda-UI project

#### Initial Dev Setup

> This repository contains many Node.JS packages. Each package has its own set of commands, but the most common commands are available from the root `package.json` and can be accessed using the `npm run ...` command. Here are the only four steps you should need to start developing on the app.

```bash
# Step1 Initial the project of erda-ui
  # Execute under the root directory of erda-ui
	node setup.js

  # What does this command do?
  # 1.1 Initial dependencies of shell, core, scheduler, cli
  # 1.2 Initial ./erda/config.js inside shell and core
  # 1.3 Global register erda-ui command
  # 1.4 Generate .env inside erda-ui include some environment variables


# Step2 Initial modules such as fdp and admin (Except for modules in the erda-ui directory)
  # Execute under the root directory of fdp and admin
	erda-ui setup <module> <port>  
	e.g., erda-ui setup admin 5001

  # What does this command do?
  # The port number of each module (can be viewed in .env). After successful execution, the .erda/config.js configuration file will be generated in the root directory of each module, and the path of the corresponding module will be automatically written in the .env file


# Step3 Build core package
  # Execute under directory of erda-ui/core
	npm run build-dev

  # What does this command do?
  # The core package file is generated in the public folder of the root directory, and static files are read from that directory in development mode


# Step4 Start App
  # Execute under directory of erda-ui
  	erda-ui launch

  # What does this command do?
  # The erda-ui directive contains a launch command. Executing the erda-ui launch in the root directory of erda-ui can manage the processes of multiple modules in the same window simultaneously, and it will launch the corresponding services based on the modules registered in the .env file
```

## Architecture
Technology stack：

* UI library: Ant Design & Terminus NUSI
* state management: cube-state
* i18n: i18next
* bundler: webpack

This project contain the following parts:
* cli: command line interface for erda-ui, help to quick setup develop environment and pack files to docker images.
* core: provide registration framework and core functions such as initialize cube-state and i18n etc.
* shell: provide layout, user and common components for business modules.
* scheduler: support module federation style development, register and navigate to multiple modules.
* modules: business modules, each of these can develop and publish standalone.


![architecture](./docs/files/architecture.jpg)
<div align="center">
architecture of development mode
</div>

## 🔗 Links

- [Erda Cloud](https://erda.cloud)(comming soon)
- [Official Website](https://www.erda.cloud)(comming soon)
- [User Docs](https://erda-docs.app.terminus.io/)
- [Backend project](https://github.com/erda-project/erda)

## 🤝 Contributing [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

We welcome all contributions. Please read our [CONTRIBUTING.md](https://github.com/erda-project/erda-ui/blob/master/.github/CONTRIBUTING.md) first. You can submit any ideas as [pull requests](https://github.com/erda-project/erda-ui/pulls) or as [GitHub issues](https://github.com/erda-project/erda-ui/issues?template=bug-template). If you'd like to improve code, check out the [Development Instructions](https://github.com/erda-project/erda-ui/wiki/Development) and have a good time! :)


## Contact Us

We look forward to your connecting with us, you can ask us any questions.

- Email: erda@terminus.io
- 知乎：[Erda技术团队](https://www.zhihu.com/people/erda-project) (A Chinese knowledge community, similar to Quora.)
- 微信公众号（Wechat）:

<div align="left">
	<img src="./docs/files/wechat.jpg" alt="Wechat" width="150">
</div>

- 钉钉用户群（Dinktalk）:
  
<div align="left">
	<img src="https://raw.githubusercontent.com/erda-project/erda/develop/docs/assets/dingtalk.png" alt="Dingtalk" width="150">
</div>

## License
Erda is under the AGPL 3.0 license. See the [LICENSE](/LICENSE) file for details.
