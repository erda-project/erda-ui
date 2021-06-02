const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const chalk = require('chalk');


const log = (...msg) => console.log(chalk.blue(`[Scheduler] ${msg}`));

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);


const getEnv = () => {
  const erdaRoot = path.resolve(__dirname, '../..');
  const staticDir = `${erdaRoot}/public/static`;
  const { parsed: envConfig } = dotenv.config({ path: `${erdaRoot}/.env` });
  if (!envConfig) {
    throw Error('cannot find .env file in erda-ui root directory');
  }
  return {
    erdaRoot,
    staticDir,
    envConfig,
  }
}

module.exports = {
  log,
  getDirectories,
  getEnv,
};

