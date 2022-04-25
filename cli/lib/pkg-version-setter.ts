import path from 'path';
import fs from 'fs';
import inquirer from 'inquirer';
import { isCwdInRoot } from './util/env';
import { logSuccess, logError } from './util/log';
import semver from 'semver';

export default async () => {
  isCwdInRoot({ alert: true });
  const { version } = await inquirer.prompt({
    type: 'input',
    name: 'version',
    message: 'type in the version to set',
  });
  if (!version) {
    process.exit(1);
  }
  const cwd = process.cwd();
  const pkgRoots = [
    cwd,
    path.resolve(cwd, 'shell'),
    path.resolve(cwd, 'core'),
    path.resolve(cwd, 'scheduler'),
    path.resolve(cwd, 'modules', 'uc'),
    path.resolve(cwd, 'modules', 'market'),
  ];
  if (!semver.valid(version)) {
    logError(`version ${version} is not valid`);
    process.exit(1);
  }
  pkgRoots.forEach((pkgRoot) => updatePackage(pkgRoot, version));
  logSuccess(`version ${version} has been set`);
};

function updatePackage(pkgRoot: string, version: string) {
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = version;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}
