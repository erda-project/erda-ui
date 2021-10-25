// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import path from 'path';

export type Modules = 'shell' | 'admin' | 'fdp';

export const externalModules = ['admin', 'fdp'];

export const internalModules = ['shell'];

// all locale path
export const localePathMap = {
  default: path.resolve(process.cwd(), 'locales'),
  shell: path.resolve(process.cwd(), 'shell', 'app', 'locales'),
  fdp: path.resolve(process.cwd(), '..', 'erda-ui-enterprise', 'fdp', 'src', 'locales'),
  admin: path.resolve(process.cwd(), '..', 'erda-ui-enterprise', 'admin', 'src', 'locales'),
};

// all source code locations includes enterprise
export const srcDirMap = {
  shell: [
    path.resolve(process.cwd(), 'shell', 'app'),
    path.resolve(process.cwd(), '..', 'erda-ui-enterprise', 'cmp'),
    path.resolve(process.cwd(), '..', 'erda-ui-enterprise', 'msp'),
  ],
  fdp: [path.resolve(process.cwd(), '..', 'erda-ui-enterprise', 'fdp', 'src')],
  admin: [path.resolve(process.cwd(), '..', 'erda-ui-enterprise', 'admin', 'src')],
};
