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

import { Module } from '@nestjs/common';
import path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { getEnv } from './util';

const { erdaRoot } = getEnv();
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(erdaRoot, 'public'),
      serveRoot: '/',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
