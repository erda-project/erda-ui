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

import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import path from 'path';
import { getEnv } from '../util';

const { publicDir, staticDir } = getEnv();

@Controller('uc')
export class UCController {
  @Get('uc/*')
  handleUC(@Req() req: Request, @Res() res: Response) {
    const extension = path.extname(req.path);
    if (!extension) {
      res.sendFile(path.join(staticDir, 'uc', 'index.html'));
    } else {
      res.sendFile(path.join(publicDir, req.path));
    }
  }
}
