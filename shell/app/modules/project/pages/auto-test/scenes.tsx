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

import React from 'react';
import routeInfoStore from 'core/stores/route';
import DiceConfigPage from 'app/config-page';
import { useUpdate } from 'common/use-hooks';
import i18n from 'i18n';
import { Drawer } from 'antd';
import { get, set, find, map, indexOf, isEmpty, sortBy } from 'lodash';
import { BuildLog } from 'application/pages/build-detail/build-log';
import InfoPreview from 'config-page/components/info-preview/info-preview';
import ImportFile from './import-file';
import ImportRecord from './scenes-import-record';

const AutoTestScenes = () => {
  const [{ projectId, spaceId }] = routeInfoStore.useStore((s) => [s.params]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const [{ logVisible, logProps, resultVis, previewData, importVis, recordVis }, updater, update] = useUpdate({
    logVisible: false,
    logProps: {},
    resultVis: false,
    previewData: {} as CP_INFO_PREVIEW.Props,
    importVis: false,
    recordVis: false,
  });
  const inParams = {
    projectId: +projectId,
    spaceId: +spaceId,
  };

  const hideLog = () => {
    update({
      logVisible: false,
      logProps: {},
    });
  };

  const closeResult = () => {
    update({
      resultVis: false,
      previewData: {} as CP_INFO_PREVIEW.Props,
    });
  };

  const onCloseImport = () => {
    updater.importVis(false);
  };

  return (
    <>
      <DiceConfigPage
        scenarioType="auto-test-scenes"
        scenarioKey="auto-test-scenes"
        inParams={inParams}
        customProps={{
          executeTaskTable: {
            op: {
              operations: {
                checkLog: (d: { logId: string; pipelineId: string; nodeId: string }) => {
                  const { logId, pipelineId: pId, nodeId: nId } = get(d, 'meta') || {};
                  if (logId) {
                    update({
                      logVisible: true,
                      logProps: {
                        logId,
                        title: i18n.t('msp:log details'),
                        customFetchAPIPrefix: `/api/apitests/pipeline/${pId}/task/${nId}/logs`,
                        pipelineID: pId,
                        taskID: nId,
                        downloadAPI: '/api/apitests/logs/actions/download',
                      },
                    });
                  }
                },
                checkDetail: (d: {
                  meta: {
                    metadata: Array<{ type: string; value: string; name: string }>;
                    errors: Array<{ name: string; value: string; msg: string }>;
                  };
                }) => {
                  if (d) {
                    update({
                      resultVis: true,
                      previewData: getPreviewData(d),
                    });
                  }
                },
              },
            },
          },
          moreOperation: {
            op: {
              import: () => {
                updater.importVis(true);
              },
              record: () => {
                updater.recordVis(true);
              },
            },
          },
        }}
      />
      <BuildLog visible={logVisible} hideLog={hideLog} {...logProps} />
      <Drawer width={1000} visible={resultVis} onClose={closeResult} getContainer={false}>
        <InfoPreview {...previewData} />
      </Drawer>
      <ImportFile visible={importVis} onClose={onCloseImport} type="testCaseSet" />
      <Drawer
        title={i18n.t('recent import and export records')}
        width={1000}
        destroyOnClose
        visible={recordVis}
        getContainer={false}
        onClose={() => updater.recordVis(false)}
      >
        {recordVis ? <ImportRecord /> : null}
      </Drawer>
    </>
  );
};
export default AutoTestScenes;

const labelMap = {
  api_request: i18n.t('request detail'),
  api_response: i18n.t('response detail'),
  api_assert_detail: i18n.t('dop:assertion detail'),
  api_assert_success: i18n.t('dop:assertion result'),
  status: i18n.t('status'),
  result: i18n.t('result'),
};

interface IJsonObjVal {
  name: string;
  value: string;
}

const parseObj = (obj: Obj, key: string) => {
  let curObj = { ...obj };
  try {
    set(curObj, key, JSON.parse(get(curObj, key)));
  } catch (e) {
    curObj = { ...obj };
  }
  return curObj;
};

const getJsonObj = (val: IJsonObjVal) => {
  if (isEmpty(val)) return val;
  let jsonObj = parseObj(val, 'value');
  if (val.name === 'api_response' && get(jsonObj, 'value.body')) {
    jsonObj = parseObj(jsonObj, 'value.body');
  } else if (val.name === 'api_request' && get(jsonObj, 'value.body.content')) {
    jsonObj = parseObj(jsonObj, 'value.body.content');
  }
  return jsonObj;
};
const apiResultKeys = ['api_request', 'api_response', 'api_assert_detail', 'api_assert_success'];

interface ResultDataItem {
  key: string[];
  value: {
    data: { type: string; value: string; name: string };
    render: {
      type: string;
      dataIndex: string;
      props: { title: string; minHeight: number; actions: { copy: boolean } };
    };
  };
}

export const getPreviewData = (d: {
  meta: {
    metadata: Array<{ type: string; value: string; name: string }>;
    errors: Array<{ name: string; value: string; msg: string }>;
  };
}) => {
  const { metadata = [], errors = [] } = d?.meta || {};

  const fileDownload: React.ReactNode[] = [];
  const resultData: ResultDataItem[] = [];
  (metadata || []).forEach((item) => {
    if (item.type === 'DiceFile') {
      fileDownload.push(
        <div key={`${fileDownload.length}`}>
          <a download={item.value} href={`/api/files/${item.value}`}>
            {item.name || item.value}
          </a>
        </div>,
      );
    } else {
      resultData.push({
        key: [item.name],
        value: {
          data: apiResultKeys.includes(item.name) ? getJsonObj(item as IJsonObjVal) : item,
          render: {
            type: 'FileEditor',
            dataIndex: `${encodeURIComponent(item.name)}.value`, // 此处name存在 a.b 或a[0]的方式，对取值有影响；
            props: {
              title: labelMap[item.name] || item.name,
              minHeight: 40,
              actions: { copy: true },
            },
          },
        },
      });
    }
  });
  const resKeys = map(resultData, 'key');
  const dataObj = {} as Obj;
  const renderList = [];

  if (errors.length) {
    dataObj._errors = errors.map((err, idx: number) => (
      <div key={`error-${String(idx)}`} className="test-case-node-msg">
        <span className="">{err.name || 'error'}: </span>
        {err.value || err.msg}
      </div>
    ));
    renderList.push({
      type: 'custom',
      dataIndex: '_errors',
      props: {
        title: i18n.t('error detail'),
      },
    });
  }

  map(
    sortBy(resKeys, (sKey) => {
      const idx = indexOf([...apiResultKeys, 'status', 'result'], sKey);
      return idx === -1 ? resKeys.length : idx;
    }),
    (key) => {
      const curData = get(find(resultData, { key }), 'value') || {};
      if (curData?.data !== undefined || curData?.data !== null) {
        // 对应上方的key转换
        dataObj[encodeURIComponent(key)] = curData?.data;
        renderList.push(curData?.render);
      }
    },
  );

  if (fileDownload.length) {
    dataObj._fileDownLoad = fileDownload;
    renderList.push({
      type: 'custom',
      dataIndex: '_fileDownLoad',
      props: {
        title: i18n.t('Download'),
      },
    });
  }

  const previewData = {
    data: {
      info: {
        _drawerTitle: i18n.t('dop:execute result'),
        ...dataObj,
      },
    },
    props: {
      render: [{ type: 'Title', dataIndex: '_drawerTitle' }, ...renderList],
    },
  } as Obj as CP_INFO_PREVIEW.Props;

  return previewData;
};
