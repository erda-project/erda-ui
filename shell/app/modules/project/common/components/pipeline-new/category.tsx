import * as React from 'react';
import i18n from 'i18n';
import { Spin, Input, Tooltip, Divider } from 'antd';
import { Badge, ErdaIcon, Ellipsis } from 'common';
import { getPipelineTypesList } from 'project/services/pipeline';
import routeInfoStore from 'core/stores/route';
import { debounce } from 'lodash';
import { updateSearch } from 'common/utils';
import { useMount, useUpdateEffect } from 'react-use';

import './category.scss';

interface IProps {
  projectId: string;
  appId?: string;
  className?: string;
  onChange?: (category: { key: string; rules?: string[] }) => void;
}

export const categoryAll = {
  key: 'all',
  category: i18n.t('dop:All'),
  runningNum: 0,
  failedNum: 0,
  totalNum: 0,
  rules: [],
};
const Category = React.forwardRef((props: IProps, ref: React.Ref<{ reload: () => void }>) => {
  const { projectId, className, onChange, appId } = props;
  const [chosenCategory, setChosenCategory] = React.useState<{ key: string; rules?: string[] }>(
    {} as { key: string; rules?: string[] },
  );
  const [searchValue, setSearchValue] = React.useState('');
  const [list, loading] = getPipelineTypesList.useState();
  const { pipelineCategory: routeChosenCategory } = routeInfoStore.useStore((s) => s.query);

  const { key: chosenCategoryKey } = chosenCategory;

  useMount(() => {
    getList();
  });

  const getList = () => {
    getPipelineTypesList.fetch({ projectID: projectId, appID: appId });
  };

  React.useEffect(() => {
    if (!chosenCategoryKey && list?.length) {
      setChosenCategory(
        (routeChosenCategory ? list.find((item) => item.key === routeChosenCategory) : list?.[0]) || categoryAll,
      );
    }
  }, [list, chosenCategoryKey, routeChosenCategory]);

  React.useEffect(() => {
    chosenCategoryKey && updateSearch({ pipelineCategory: chosenCategoryKey });
  }, [chosenCategoryKey]);

  const search = debounce((value: string) => {
    setSearchValue(value);
  }, 1000);

  React.useImperativeHandle(ref, () => ({
    reload: getList,
  }));

  useUpdateEffect(() => {
    onChange?.(chosenCategory);
  }, [chosenCategory]);

  return (
    <div className={`bg-default-02 overflow-auto h-full  ${className}`}>
      <div className={'flex flex-col pipeline-category'}>
        <div className="p-4 leading-4 font-medium">{i18n.t('dop:Pipeline type')}</div>
        <Input
          size="small"
          className="bg-default-06 border-transparent mb-2 mx-4"
          style={{ width: 'auto' }}
          prefix={<ErdaIcon size="16" fill="default-3" type="search" />}
          placeholder={i18n.t('search {name}', { name: i18n.t('dop:Pipeline type') })}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => search(e.target.value)}
        />
        <div className="flex-1">
          <Spin spinning={loading}>
            <div>
              {[
                categoryAll,
                ...(list || [])?.filter((item) => (searchValue ? item.category.includes(searchValue) : true)),
              ]?.map((item) => (
                <div
                  key={item.key}
                  className={`pipeline-category-item px-4 py-2 cursor-pointer rounded-sm flex flex-col ${
                    chosenCategory.key === item.key ? 'text-purple-deep active' : 'hover:bg-white'
                  }`}
                  onClick={() => {
                    if (item.key !== chosenCategory.key) {
                      setChosenCategory(item);
                    }
                  }}
                >
                  <div className="flex-h-center leading-5 flex-1">
                    <div className="flex-1 min-w-0">
                      <Ellipsis title={item.category} />
                    </div>
                    {item.key === categoryAll.key ? null : (
                      <div className="bg-default-04 text-default-9 rounded-2xl px-3 py-0.5 text-xs flex-h-center">
                        {item.runningNum ? (
                          <Tooltip title={i18n.t('Running')}>
                            <div className="flex-h-center mr-0.5">
                              <Badge onlyDot breathing status={'success'} className="mr-0.5" />
                              <div>{item.runningNum}</div>
                            </div>
                          </Tooltip>
                        ) : null}
                        {item.failedNum ? (
                          <Tooltip title={i18n.t('dop:number of failures in a day')}>
                            <div className="flex-h-center">
                              <Badge onlyDot breathing status={'error'} className="mr-0.5" />
                              <div>{item.failedNum}</div>
                            </div>
                          </Tooltip>
                        ) : null}
                        {(item.runningNum || item.failedNum) && item.totalNum ? (
                          <Divider type="vertical" className="top-0" />
                        ) : null}
                        <Tooltip title={i18n.t('dop:total number of pipelines')}>
                          <div>{item.totalNum || 0}</div>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                  {item.rules?.length ? (
                    <div className="whitespace-nowrap text-default-6 text-xs">
                      <Ellipsis title={item.rules.join(', ')} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Spin>
        </div>
      </div>
    </div>
  );
});

export default Category;
