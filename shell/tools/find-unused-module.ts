import { resolve, normalize } from 'path';
import fastGlob from 'fast-glob';
import { traverseModule, setRequirePathResolver } from './traverse-module';

interface Options {
  cwd: string;
  entries: string[];
  includes: string[];
  resolveRequirePath?: (curDir: string, requirePath: string) => string;
}

const defaultOptions: Options = {
  cwd: '',
  entries: [],
  includes: ['**/*', '!node_modules'],
};

const ignoreSuffix = ['.md', '.d.ts'];
const ignorePath = ['__tests__', 'config-page'];

function findUnusedModule(options: Options) {
  const { cwd, entries, includes, resolveRequirePath } = { ...defaultOptions, ...options };

  const includeContentPath = includes.map((includePath) => (cwd ? `${cwd}/${includePath}` : includePath));

  const allFiles = fastGlob.sync(includeContentPath).map((item) => normalize(item));
  const entryModules: string[] = [];
  const usedModules: string[] = [];

  setRequirePathResolver(resolveRequirePath);
  entries.forEach((entry) => {
    const entryPath = resolve(cwd, entry);
    entryModules.push(entryPath);
    traverseModule(entryPath, (modulePath: string) => {
      usedModules.push(modulePath);
    });
  });

  const unusedModules = allFiles.filter((filePath) => {
    const resolvedFilePath = resolve(filePath);
    return (
      !entryModules.includes(resolvedFilePath) &&
      !usedModules.includes(resolvedFilePath) &&
      !ignoreSuffix.some((item) => resolvedFilePath.endsWith(item)) &&
      !ignorePath.some((item) => resolvedFilePath.includes(item))
    );
  });
  return {
    all: allFiles,
    used: usedModules,
    unused: unusedModules,
  };
}

export default findUnusedModule;
