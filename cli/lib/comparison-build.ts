import { promisify } from 'util';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import { logInfo, logSuccess, logError } from './util/log';

const { exec } = child_process;
const asyncExec = promisify(exec);

const buildWithComparingGitSha = async ({ module }: { module: string }) => {
  const moduleName = module;
  const cwd = process.cwd();
  const staticPath = path.join(
    cwd,
    ['fdp', 'admin', 'market'].includes(moduleName)
      ? `../../public/static/${moduleName}`
      : `../public/static/${moduleName}`,
  );
  logInfo('Looking for build cache at:', staticPath);
  logInfo(`Start compare diff for ${moduleName}`);
  let { stdout: headSha } = await asyncExec('git rev-parse --short HEAD', { cwd });
  headSha = headSha.replace(/\n/, '');
  try {
    const gitVersionPath = path.resolve(staticPath, '.git-version');
    let prevGitSha = '';
    if (fs.existsSync(gitVersionPath)) {
      prevGitSha = fs.readFileSync(gitVersionPath, { encoding: 'utf8' });
      logInfo('Found previous git sha:', prevGitSha);
      const { stdout: diff } = await asyncExec(`git diff --name-only ${prevGitSha} ${headSha}`);
      logInfo('File diff:', diff);
      if (new RegExp(`^${moduleName}/`, 'gm').test(diff)) {
        logInfo(`Changes detected between ${prevGitSha} and ${headSha}. will start build ${moduleName}`);
        build(moduleName, headSha, staticPath);
      } else {
        logInfo(`No change detected between ${prevGitSha} and ${headSha}. will skip build ${moduleName}`);
      }
    } else {
      logInfo('No version file found, starting new build...');
      build(moduleName, headSha, staticPath);
    }
  } catch (error) {
    logError('Compare diff failed', error.toString());
    logInfo('Will start build');
    build(moduleName, headSha, staticPath);
  }
};

const build = async (moduleName: string, sha: string, staticPath: string) => {
  await asyncExec(['fdp', 'admin'].includes(moduleName) ? 'npm i' : 'echo skip install', { cwd: process.cwd() });
  const execProcess = exec(
    'npm run build',
    {
      env: {
        ...process.env,
        isOnline: 'true',
        dataEngineerInfo: JSON.stringify({ name: 'fdp', indexUrl: '' }),
      },
      cwd: process.cwd(),
    },
    (error: unknown) => {
      if (error) {
        process.exit(1);
      } else {
        logSuccess('build successfully!');
        fs.writeFileSync(`${staticPath}/.git-version`, sha, 'utf8');
        logSuccess('generated new .git-version:', sha);
      }
    },
  );
  execProcess.stdout?.on('data', (data) => logInfo(data));
  execProcess.stderr?.on('data', (data) => logError(data));
};

export default buildWithComparingGitSha;
