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
import { logger } from 'src/util';
import axios from 'axios';
import md5 from 'md5';

@Controller('getLinksToken')
export class LinksTokenController {
  @Get()
  async getToken(@Res() response: Response, @Req() request: Request) {
    try {
      if (!request.query.orgName || !request.query.userName || !request.query.userId) {
        throw new Error('no org or no userName for Links Token');
      }
      const linksAuthToken = this.buildLinksAuthToken();
      if (!linksAuthToken) {
        throw new Error('ak or sk not provided');
      }
      const result = await axios.post(
        `https://links-openapi.alipay.com/openapi/room/6295896f51a53d0479bd6528/token/create`,
        {
          roomId: '6295896f51a53d0479bd6528',
          userId: `${request.query.orgName}-${request.query.userId}`,
          userName: `${request.query.orgName}-${request.query.userName}`,
          accountSystem: 'Terminus',
          permission: 'ROOM',
        },
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            LinksAuthToken: linksAuthToken,
          },
        },
      );
      const token = result.data.result;
      response.end(token);
    } catch (error) {
      logger.error('Failed to get LinkS token: ', error);
      response.statusCode = 500;
      response.statusMessage = 'Failed to get LinkS token';
      response.end();
    }
  }

  buildLinksAuthToken() {
    const ak = process.env.LINKS_AK;
    const sk = process.env.LINKS_SK;
    if (!ak || !sk) {
      return null;
    }
    const timestamp = new Date().getTime();
    const sign = md5(ak + timestamp + sk);
    return ak + '.' + timestamp + '.' + sign;
  }
}
