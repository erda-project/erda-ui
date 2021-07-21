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

declare namespace MS_INDEX {
  interface IMspProject {
    id: string;
    type: PROJECT.ProjectType;
    logoUrl: string;
    projectName: string;
    workSpaces: Record<string, string>;

    projectId: string;
    envs: [string, string, string, string];
    tenantGroups: [string, string, string, string];
  }

  interface IMspMenu {
    href: string;
    key: string; // menuKey，用于匹配菜单高亮
    clusterName: string;
    clusterType: string;
    cnName: string;
    enName: string;
    exists?: boolean; // false表示没有用到或还未拉起来，先展示引导页
    params: {
      [key: string]: string;
      key: string;
      tenantId: string;
      terminusKey: string;
      tenantGroup: string;
    };
    children: IMspMenu[];
  }

  interface Menu {
    href: string;
    icon?: string;
    key: string;
    text: string;
    prefix: string;
    subMenu?: Menu[];
  }

  interface MenuMap {
    [k: string]: IMspMenu;
  }
}
