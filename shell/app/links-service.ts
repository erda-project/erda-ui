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

import axios from 'axios';

export function initLinkS(userId: string, userName: string, orgName: string) {
  const ak = process.env.LINKS_AK;
  const sk = process.env.LINKS_SK;
  if (ak && sk) {
    axios
      .get('/getLinksToken', { params: { userId, userName, orgName } })
      .then((res) => {
        // @ts-ignore LinkS
        if (window.LinkS) {
          Reflect.deleteProperty(window, 'LinkS');

          const node1 = document.getElementById('links-widget-div');
          const node2 = document.getElementById('links-tip-container');
          const node3 = document.querySelector('.links-card-div');
          const node4 = document.getElementById('last-links');
          if (node1 && node2 && node3 && node4) {
            document.body.removeChild(node1);
            document.body.removeChild(node2);
            document.body.removeChild(node3);
            document.head.removeChild(node4);
          }
        }

        const element = document.createElement('script');
        element.src = `https://links-tp.alipay.com/widgetInit/6295896f51a53d0479bd6528/?links_auth_token=${res.data}`;
        element.type = 'text/javascript';
        element.async = true;
        element.id = 'last-links';

        element.onerror = (e) => {
          console.error('Failed to load LinkS:', e);
        };

        document.head.appendChild(element);
      })
      .catch((e) => {
        console.error('get Links Token failed', e);
      });
  }
}
