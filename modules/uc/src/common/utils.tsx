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
import { parse } from 'query-string';

export const keepRedirectUrlQuery = (url: string, redirect_uri?: string) => {
  const query = parse(window.location.search);
  const curRedirectUrl = redirect_uri || query?.redirect_uri;
  if (curRedirectUrl && !url.includes('redirect_uri=')) {
    return `${url}${url.includes('?') ? '&' : '?'}redirect_uri=${curRedirectUrl}`;
  }
  return url;
};
