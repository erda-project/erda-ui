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

import { ExceptionFilter, Catch, NotFoundException, HttpException, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import path from 'path';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  // some action as nginx try_files
  catch(_exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const match = /^\/[a-zA-Z-_]+\/market(.*)/.exec(request.path);
    const extension = path.extname(request.path);
    if (!extension) {
      if (match) {
        response.sendFile(path.join(__dirname, '../../public/static/market', 'index.html'));
      } else {
        response.sendFile(path.join(__dirname, '../../public/static/shell', 'index.html'));
      }
    } else {
      response.statusCode = 404;
      response.end('Not Found');
    }
  }
}
