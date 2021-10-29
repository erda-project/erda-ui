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

import React, { useRef } from 'react';
import { useMedia, useSize, useSetState, useUnmount } from 'react-use';
import { getLS, setLS, notify } from 'common/utils';
import { isFunction } from 'lodash';
import { DropTargetMonitor, useDrag, useDrop, XYCoord, DragSourceMonitor } from 'react-dnd';
import FormModal from './components/form-modal';

export enum ScreenSize {
  xs = 768,
  sm = 1024,
  md = 1440,
  lg = 1680,
  xl = 1920,
}

const defaultIgnoreWidth = 48 + 200 + 32; // nav(48px) + sidebar(200px) + main Padding(32px)

/**
 * 批量观察断点响应, 返回从xs到xl的检查值
 * xs:768  sm:1024  md:1440  lg:1680  xl:1920
 * @param main 只观察主区域（不含nav和sidebar）
 * @param ignoreWidth 忽略的宽度（默认为nav+sidebar）
 * @return [largeThanXs, largeThanSm, ...]
 */
export const useMediaRange = (main = false, ignoreWidth = defaultIgnoreWidth) => {
  const extraWidth = main ? ignoreWidth : 0;

  const largeThanXs = useMedia(`(min-width: ${ScreenSize.xs + extraWidth}px)`);
  const largeThanSm = useMedia(`(min-width: ${ScreenSize.sm + extraWidth}px)`);
  const largeThanMd = useMedia(`(min-width: ${ScreenSize.md + extraWidth}px)`);
  const largeThanLg = useMedia(`(min-width: ${ScreenSize.lg + extraWidth}px)`);
  const largeThanXl = useMedia(`(min-width: ${ScreenSize.xl + extraWidth}px)`);
  return [largeThanXs, largeThanSm, largeThanMd, largeThanLg, largeThanXl];
};

/**
 * 返回小、中、大屏的检查值, 为了配合设计给的三个响应点
 *
 * 内容区宽度 > 600 | 1024 | 1440
 * @return [largeThan600, largeThan1024, largeThan1440]
 */
export const useMediaSize = () => {
  const largeThan600 = useMedia(`(min-width: ${600 + defaultIgnoreWidth}px)`);
  const largeThan1024 = useMedia(`(min-width: ${1024 + defaultIgnoreWidth}px)`);
  const largeThan1440 = useMedia(`(min-width: ${1440 + defaultIgnoreWidth}px)`);
  return [largeThan600, largeThan1024, largeThan1440];
};

export const useMediaGt = (num: number, main = false, ignoreWidth = defaultIgnoreWidth) =>
  useMedia(`(min-width: ${num + (main ? ignoreWidth : 0)}px)`);
export const useMediaLt = (num: number, main = false, ignoreWidth = defaultIgnoreWidth) =>
  useMedia(`(max-width: ${num + (main ? ignoreWidth : 0)}px)`);

export const useComponentWidth = () => {
  const [sized, { width }] = useSize(() => <div style={{ width: '100%' }} />);
  return [sized, width];
};

type on = () => void;
type off = () => void;
type toggle = () => void;
/**
 * 切换boolean值
 * @param initValue
 * @return [ value, on, off, toggle ]
 */
export const useSwitch = (initValue: boolean): [boolean, on, off, toggle] => {
  const [bool, setBool] = React.useState(Boolean(initValue));

  return [
    bool,
    function on() {
      setBool(true);
    },
    function off() {
      setBool(false);
    },
    function toggle() {
      setBool(!bool);
    },
  ];
};

interface DragItem {
  index: number;
  type: string;
}
interface IDragProps {
  type: string;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => any;
  collect?: (monitor: DragSourceMonitor) => any;
}

/**
 * 列表项拖拽排序
 * @param type {string} 类型标记
 * @param index {number} 序号
 * @param onMove 参数(fromIndex, toIndex) 移动后的回调
 * @param collect 参数(monitor) 获得拖拽中的相关信息
 * @return [dragRef, previewRef, collectedProps]
 */
export const useListDnD = ({ type, index, onMove, collect }: IDragProps) => {
  const dragRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: type,
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!dragRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = dragRef.current!.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [collectedProps, drag, previewRef] = useDrag({
    item: { index, type },
    collect,
  });

  drag(drop(dragRef));

  return [dragRef, previewRef, collectedProps];
};

type UpdateFn<T> = (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void;
type UpdatePartFn<U> = (patch: U | Function) => void;

type UpdaterFn<T> = {
  [K in keyof T]: UpdatePartFn<T[K]>;
};

// 测试 useUpdate 类型
// const Test = () => {
//   const [state, updater] = useUpdate({
//     str: '',
//     num: 0,
//     bool: true,
//     undef: undefined,
//     nul: null,
//     strList: ['one', 'two'],
//     numList: [1, 2],
//     multiList: ['one', 1, false], // 允许包含的类型
//     emptyList: [], // 允许任何数组对象
//     emptyObj: {}, // 允许任何对象
//     obj: { k: 'v', n: 2 }, // 允许相同形状对象
//     objList: [{ ok: true, msg: 'yes' }], // 允许设置任意对象
//   });
//   updater.nul({ any: true });
//   updater.multiList([1, '']);
//   updater.emptyList([1, '']);
//   updater.emptyObj({ a: 2 });
//   updater.objList([{ ok: false, msg: '' }]);
//   return null;
// };

type NullableValue<T> = {
  [K in keyof Required<T>]: T[K] extends null
    ? null | Obj // 初始状态里对象值可能是null
    : T[K] extends never[]
    ? any[] // 初始值是空数组，则认为可放任意结构数组
    : T[K] extends { [p: string]: never }
    ? Obj // 初始值是空对象，不限制内部结构，是object类型即可
    : T[K];
};

type ResetFn = () => void;

/**
 * 状态更新
 * @param initState 初始状态
 * @return [state, updateAll, updater]
 */
export const useUpdate = <T extends object>(
  initState: NullableValue<T>,
): [NullableValue<T>, UpdaterFn<NullableValue<T>>, UpdateFn<NullableValue<T>>, ResetFn] => {
  const [state, _update] = useSetState<NullableValue<T>>(initState || {});
  // 使用ref，避免updater的更新方法中，在闭包里使用上次的state
  const ref = React.useRef(state);
  const updateRef = React.useRef(_update);
  ref.current = state;

  const update: any = React.useCallback((args: any) => {
    // 扩展 update 的使用, 使用方法同 useState((preState) => preState + 1)
    if (isFunction(args)) {
      return updateRef.current((prev) => args(prev));
    } else {
      return updateRef.current(args);
    }
  }, []);

  const updater: any = React.useMemo(() => {
    const result = {};
    Object.keys(ref.current).forEach((k) => {
      result[k] = (patch: Function | any) => {
        const newPart = patch instanceof Function ? patch(ref.current[k], ref.current) : patch;
        ref.current[k] = newPart;
        return updateRef.current({ [k]: newPart } as Partial<NullableValue<T>>);
      };
    });
    return result;
  }, []);

  const reset = React.useCallback(() => updateRef.current(initState), [initState]);

  useUnmount(() => {
    updateRef.current = () => {};
  });

  return [state, updater, update, reset];
};

/**
 * FormModal包装hook，内部封装visible状态
 * @param param.visible 初始状态
 * @param param.Form 分离的FormModal
 * @return [FormModal, toggle]
 */
export const useFormModal = (
  { visible: initVisible = false, Form = FormModal } = {
    visible: false,
    Form: FormModal,
  },
) => {
  const [visible, toggleVisible] = React.useState(!!initVisible);
  const toggle = (vi: boolean) => {
    const newVal = typeof vi === 'boolean' ? vi : !visible;
    toggleVisible(newVal);
    return newVal;
  };
  const Modal = (props: any) => {
    const onCancel = () => toggleVisible(false);
    return <Form onCancel={onCancel} {...props} visible={visible} />;
  };

  return [Modal, toggle as any];
};

const defaultPaging = {
  pageNo: 1,
  pageSize: 15,
  total: 0,
  hasMore: true,
};

interface ITempPagingParams<T> {
  initList?: T[];
  append?: boolean;
  listKey?: string;
  basicParams?: Obj;
  service: (params?: any) => Promise<IPagingResp<T>>;
}

const emptyList: any[] = [];
const emptyObj = {};
/**
 * 用于Modal等地方的临时分页
 * @param param.service 接口
 * @param param.initList 初始列表数据
 * @param param.basicParams 基础请求参数
 * @param param.append 追加模式
 * @param param.listKey 默认为'list',特殊情况时自定义response里list的字段名
 * @return [list, paging, loading, load, clear]
 */
export function useTempPaging<T>({
  initList = emptyList,
  append = false,
  basicParams = emptyObj,
  service,
  listKey = 'list',
}: ITempPagingParams<T>): [T[], IPaging, boolean, (params?: any) => Promise<any>, () => void] {
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState(initList);
  const [paging, setPaging] = React.useState(defaultPaging);

  const basic = React.useRef(basicParams);

  const load = React.useCallback(
    (params: Obj = {}) => {
      setLoading(true);
      return service({ pageNo: paging.pageNo, pageSize: paging.pageSize, ...basic.current, ...params })
        .then((result: any) => {
          if (result.success && result.data) {
            const newList = result.data[listKey];
            const { total } = result.data;
            if (Array.isArray(newList)) {
              if (append) {
                setList(list.concat(newList));
              } else {
                setList(newList);
              }
            }
            const nextPageNo = params.pageNo || paging.pageNo;
            const nextPageSize = params.pageSize || paging.pageSize;
            setPaging({
              pageNo: nextPageNo,
              pageSize: nextPageSize,
              total,
              hasMore: Math.ceil(total / nextPageSize) > nextPageNo,
            });
            return result.data;
          } else {
            notify('error', result.err.msg);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [append, list, listKey, paging, service],
  );

  const clear = React.useCallback(() => {
    setList([]);
    setPaging(defaultPaging);
  }, []);

  return [list, paging, loading, load, clear];
}

/**
 * 用于调试打印prop变化
 * @param list watch的变量列表
 * @param name 可选，变量名称列表
 * @usage useDiff([a, b], ['a', 'b']);
 */
export function useDiff(list: any[], name: string[]) {
  const { current: checkList } = React.useRef(list || []);
  const { current: nameList } = React.useRef(name || []);
  const { current: prevList } = React.useRef(Array(list.length).fill(undefined));

  React.useEffect(() => {
    checkList.forEach((item, i) => {
      if (prevList[i] !== item) {
        prevList[i] = item;
      }
    });
  }, [prevList, checkList, nameList]);
}
