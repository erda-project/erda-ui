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

import { erdaEnv } from 'common/constants';
import { isAccessFromLocalStorage } from './utils';
export { default as overwriteT } from './utils/overwrite-i18n';
export { default as I18nEasyEditPage } from './pages';

export const isAccess = erdaEnv.I18N_ACCESS_ENV === 'true' && isAccessFromLocalStorage();
