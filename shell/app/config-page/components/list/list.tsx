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

import * as React from 'react';
import { Tooltip, Button, Ellipsis, Pagination } from 'app/nusi';
import { Icon as CustomIcon, useUpdate, EmptyHolder } from 'common';
import { isNumber, filter, map, sortBy, isString } from 'lodash';
import { OperationAction } from 'config-page/utils';
import classnames from 'classnames';
import i18n from 'i18n';
import imgMap from '../../img-map';
import { ErdaIcon } from 'common';
import './list.scss';

const emptyArr = [] as any[];
const List = (props: CP_LIST.Props) => {
  const { customProps, execOperation, operations,
    props: configProps, data, state: propsState } = props;
  const { list = emptyArr } = data || {};
  const [state, updater, update] = useUpdate({
    ...propsState,
    combineList: list,
  });
  const { total = 0, pageSize, pageNo = 1 } = state || {};
  const { isLoadMore: useLoadMore = false, visible = true, size = 'middle', rowKey, alignCenter = false,
    noBorder = false, pageSizeOptions, ...rest } = configProps || {};

  // 将接口返回的list和之前的list进行拼接
  React.useEffect(() => {
    if (data === undefined) {
      return;
    }
    update((pre) => {
      const newState = {
        ...pre,
        ...propsState,
      };
      return {
        ...newState,
        combineList: newState.pageNo === 1 ? list : (newState.combineList || []).concat(list),
      };
    });
  }, [propsState, list, update, data]);

  const pagination = React.useMemo(() => {
    return isNumber(pageNo) ? {
      total: total || list?.length,
      current: pageNo || 1,
      pageSize: pageSize || 20,
      onChange: (no: number) => changePage(no),
      ...(pageSizeOptions ? {
        showSizeChanger: true,
        pageSizeOptions,
        onShowSizeChange: (_no: number, pSize: number) => {
          changePageSize(pSize);
        },
      } : {}),
    } : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, pageSize, total]);

  if (!visible) return null;

  const changePage = (pNo: number) => {
    operations?.changePageNo && execOperation(operations.changePageNo, operations.changePageNo.fillMeta ? pNo : { pageNo: pNo });
  };

  const loadMore = () => {
    operations?.changePageNo && execOperation(operations.changePageNo, { pageNo: pageNo + 1 });
  };

  const changePageSize = (pSize: number) => {
    operations?.changePageSize && execOperation(operations.changePageSize, { pageNo: 1, pageSize: pSize });
  };

  const getKey = (item: CP_LIST.IListData, idx: number) => {
    return rowKey ? item[rowKey] : `${idx}-${item.title}`;
  };

  return (
    <div className='cp-list'>
      {
        (state.combineList || []).length ? (
          <>
            {(state.combineList || []).map((item, idx) => {
              return <Item size={size} customProps={customProps} execOperation={execOperation} key={getKey(item, idx)} data={item} alignCenter={alignCenter} noBorder={noBorder} />;
            })}
            {!useLoadMore && pagination ? (
              <Pagination className='right-flex-box mt12' {...pagination} />
            ) : null
            }
            {useLoadMore && total > Math.max(state.combineList?.length, 0)
              && <div className='hover-active load-more' onClick={loadMore}>{i18n.t('more')}</div>}
          </>
        ) : <EmptyHolder relative />
      }

    </div>
  );
};

interface ItemProps {
  size?: 'small' | 'middle' | 'large';
  data: CP_LIST.IListData;
  alignCenter?: boolean;
  noBorder?: boolean;
  execOperation: (opObj: { key: string, [p: string]: any }, updateData?: any) => void;
  customProps?: Obj;
}
const Item = (props: ItemProps) => {
  const { execOperation, size = 'middle', data, alignCenter = false,
    noBorder = false, customProps } = props;
  const { operations = {}, prefixImg, title, titlePrifxIcon, prefixImgCircle, titlePrifxIconTip, titleSuffixIcon, titleSuffixIconTip, description = '', extraInfos } = data || {};
  const actions = sortBy(filter(map(operations) || [], item => item.show !== false), 'showIndex');

  const itemClassNames = classnames({
    'v-align': alignCenter,
    'no-border': noBorder,
    [size]: size,
    'cp-list-item': true,
    'pointer': true,
  });
  const onClickItem = () => {
    if (operations?.click) {
      execOperation(operations.click, data);
    }
    if (customProps?.clickItem) {
      customProps.clickItem(operations?.click, data);
    }
  };

  return (
    <div className={itemClassNames} onClick={onClickItem}>
      {
        isString(prefixImg) ? (
          <div className='cp-list-item-prefix-img'>
            <img src={prefixImg.startsWith('/images') ? imgMap[prefixImg] : prefixImg as string} className={`item-prefix-img ${prefixImgCircle ? 'prefix-img-circle' : ''}`} />
          </div>
        ) : (
            prefixImg ? (
              <div className='cp-list-item-prefix-img'>
                {prefixImg}
              </div>
            ) : null
          )
      }
      <div className='cp-list-item-body'>
        <div className={`body-title`}>
          {
            titlePrifxIcon ? (
              <Tooltip title={titlePrifxIconTip}>
                <CustomIcon type={titlePrifxIcon} className='title-icon mr8' />
              </Tooltip>
            ) : null
          }
          <Ellipsis className='bold title-text' title={title} />
          {
            titleSuffixIcon ? (
              <Tooltip title={titleSuffixIconTip}>
                <CustomIcon type={titleSuffixIcon} className='title-icon ml8' />
              </Tooltip>
            ) : null
          }
        </div>
        {description ? <Ellipsis className='body-description' title={description} /> : null}
        {
          extraInfos ? (
            <div className='body-extra-info'>
              {
                extraInfos.map((info, idx) => {
                  const extraProps = {} as Obj;
                  if (info.operations?.click) {
                    extraProps.onClick = (e: MouseEvent) => {
                      e && e.stopPropagation();
                      const curOp = (info.operations as Obj<CP_COMMON.Operation>).click;
                      execOperation(curOp, data);
                      if (customProps && customProps[curOp.key]) {
                        customProps[curOp.key](curOp, data);
                      }
                    };
                  }
                  return (
                    <Tooltip key={idx} title={info.tooltip}>
                      <span className={`info-item type-${info.type || 'normal'}`} {...extraProps}>
                        {info.icon ? <ErdaIcon iconType={info.icon} size={16} /> : null}
                        <span className='info-text nowrap'>{info.text}</span>
                      </span>
                    </Tooltip>
                  );
                })
              }
            </div>
          ) : null
        }
      </div>
      {
        actions?.length ? (
          <div className='cp-list-item-operations' onClick={e => e?.stopPropagation()}>
            {
              actions.map(action => {
                return (
                  <OperationAction
                    key={action.key}
                    operation={action}
                    onClick={() => {
                      execOperation(action);
                      if (customProps && customProps[action.key]) {
                        customProps[action.key](action, data);
                      }
                    }}
                  >
                    <Button type='link'>{action.text}</Button>
                  </OperationAction>
                );
              })
            }
          </div>
        ) : null
      }
    </div>
  );
};

export default List;
