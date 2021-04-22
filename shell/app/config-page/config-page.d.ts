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

declare namespace CONFIG_PAGE {

  // 后端给的完整结构
  interface RenderConfig {
    scenario: { // 场景
      scenarioKey: string; // 场景唯一id
      scenarioType: string; // 场景类型：由后端定义
    },
    inParams?: Obj,
    protocol?: PageConfig;
    event?: { // 用户触发的事件
      component: string; // 用户触发事件的组件ID
      operation: string; // 用户触发事件的操作名
      operationData: Obj; // 请求的数据
    }
  }

  // 前端关心的结构
  interface PageConfig {
    hierarchy: {
      root: string;
      structure: {
        [pro: string]: string[] | { [pro: string]: string | string[] }
      }
    },
    components: Obj<Comps>
  }

  type Comps = CP_CONTAINER.Spec
    | CP_SPLIT_PAGE.Spec
    | CP_FORM.Spec
    | CP_FORM_MODAL.Spec
    | CP_CARD.Spec
    | CP_DRAWER.Spec
    | CP_SPLIT_PAGE.Spec
    | CP_TABS.Spec
    | CP_TITLE.Spec
    | CP_SORT_GROUP.Spec
    | CP_BUTTON.Spec
    | CP_FILTER.Spec
    | CP_RADIO.Spec
    | CP_FILE_TREE.Spec
    | CP_PANEL.Spec
    | CP_POPOVER.Spec
    | CP_INPUT.Spec
    | CP_EDIT_LIST.Spec
    | CP_BREADCRUMB.Spec
    | CP_TREE_SELECT.Spec
    | CP_INFO_PREVIEW.Spec
    | CP_SELECT_PRO.Spec
    | CP_TEXT.Spec
    | CP_ALERT.Spec
    | CP_LIST.Spec
    | CP_TABLE.Spec
    | CP_TEXT.Spec
    | CP_EMPTY_HOLDER.Spec
    | CP_IMAGE.Spec
    | CP_DROPDOWN_SELECT.Spec
    | CP_TEXT_GROUP.Spec
    | CP_TABLE_GROUP.Spec;



  // 单个组件基础定义
  interface BaseSpec {
    type: string;
    state?: Obj;
    data?: Obj;
    props?: Obj,
    operations?: Obj<CP_COMMON.Operation>;
  }

  // 框架注入 的 props
  interface InjectProps {
    customProps?: Obj;
    execOperation: (opObj: { [p: string]: any, key: string }, updateState?: any) => void;
    updateState: (val: Obj) => void;
  }

  interface ICommonProps extends BaseSpec, InjectProps { // 公共props
  }

  interface Command {
    key: string
    target?: string,
    state?: Obj
    jumpOut?: boolean
  }

}

type MakeProps<Spec> = Merge<Omit<CONFIG_PAGE.ICommonProps, 'props'>, Spec>;
