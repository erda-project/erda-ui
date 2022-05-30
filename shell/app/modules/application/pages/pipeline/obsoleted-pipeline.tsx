import * as React from 'react';
import { Badge, Tooltip, Alert, Popover } from 'antd';

import { goTo } from 'common/utils';
import { SplitPage } from 'layout/common';
import { EmptyHolder, Icon as CustomIcon, ErdaIcon, Table } from 'common';
import routeInfoStore from 'core/stores/route';
import appStore from 'application/stores/application';
import DiceConfigPage from 'app/config-page';
import { useLoading } from 'core/stores/loading';
import { useUpdate } from 'common/use-hooks';
import { getBranchPath, ciStatusMap } from 'project/common/components/pipeline-new/config';
import { map } from 'lodash';
import Execute from 'project/common/components/pipeline-new/record-detail';
import buildStore from 'application/stores/build';
import { getTreeNodeDetailNew } from 'project/services/file-tree';
import i18n from 'i18n';
import { ColumnProps } from 'antd/lib/table';
import moment from 'moment';
import { useEffectOnce } from 'react-use';
import { updateSearch } from 'common/utils';
import './obsoleted-pipeline.scss';

const Pipeline = () => {
  const [{ projectId, appId }, { nodeId, pipelineID }] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const scopeParams = React.useMemo(() => ({ scopeID: projectId, scope: 'project-app' }), [projectId]);
  const [caseDetail, setCaseDetail] = React.useState<TREE.NODE | null>(null);

  const nodeIdRef = React.useRef(null as string | null);

  React.useEffect(() => {
    nodeIdRef.current = nodeId;
    nodeId && getCaseDetail();
  }, [nodeId]);

  const getCaseDetail = async () => {
    const res = await getTreeNodeDetailNew({ id: nodeId, scopeID: appId, scope: 'project-app' });
    setCaseDetail(res.data);
  };

  const inParams = {
    projectId,
    appId,
    ...scopeParams,
    selectedKeys: nodeId,
  };

  return (
    <div>
      <Alert
        type="info"
        message={
          <span className="">
            {i18n.s(
              'The new pipeline page interaction is about to be officially launched, and the new version will be launched at the next time the page is opened.',
              'dop',
            )}
            <span
              onClick={() => {
                goTo(goTo.pages.pipelineRoot);
              }}
              className="text-purple-deep cursor-pointer"
            >
              {i18n.s('Try it right now', 'dop')}
            </span>
          </span>
        }
        className="mb-2 bg-blue-1 border-blue"
      />
      <SplitPage className="bg-white py-3 px-4">
        <SplitPage.Left className="pipeline-manage-left">
          {pipelineID && !nodeId ? (
            <EmptyHolder relative />
          ) : (
            <DiceConfigPage
              scenarioType=""
              scenarioKey={'app-pipeline-tree'}
              inParams={inParams}
              showLoading
              forceUpdateKey={['inParams']}
              customProps={{
                fileTree: {
                  op: {
                    onClickNode: (_inode: string) => {
                      if (nodeIdRef.current !== _inode) {
                        setCaseDetail(null);
                        setTimeout(() => {
                          updateSearch({ nodeId: _inode, pipelineID: undefined });
                        }, 0);
                      }
                    },
                  },
                },
              }}
            />
          )}
        </SplitPage.Left>
        <SplitPage.Right>
          {caseDetail ? <Detail key={nodeId} caseDetail={caseDetail} /> : <EmptyHolder relative />}
        </SplitPage.Right>
      </SplitPage>
    </div>
  );
};

const Detail = ({ caseDetail }: { caseDetail: TREE.NODE }) => {
  const appDetail = appStore.useStore((s) => s.detail);
  const [{ appId, projectId }, { nodeId, pipelineID }] = routeInfoStore.useStore((s) => [s.params, s.query]);

  const [getExecuteRecordsLoading] = useLoading(buildStore, ['getExecuteRecords']);

  const [{ chosenPipelineId, recordTableKey }, updater] = useUpdate({
    chosenPipelineId: pipelineID,
    recordTableKey: 1,
  });

  const [executeRecords, recordPaging] = buildStore.useStore((s) => [s.executeRecords, s.recordPaging]);
  const { getExecuteRecords } = buildStore.effects;
  const { clearExecuteRecords } = buildStore.reducers;

  let branch = '';
  let pagingYmlNames: string[] = [];
  const isMobileInit = nodeId === 'mobile_init';
  if (isMobileInit) {
    pagingYmlNames = appDetail.projectName ? [`${appDetail.projectName}_${appDetail.name}_pipeline.yml`] : [];
  } else if (caseDetail) {
    const res = getBranchPath(caseDetail, appId);
    branch = res.branch;
    pagingYmlNames = res.pagingYmlNames;
  }

  useEffectOnce(() => {
    getRecordList();
    return () => {
      clearExecuteRecords();
    };
  });

  React.useEffect(() => {
    if (!chosenPipelineId && executeRecords?.length) {
      updater.chosenPipelineId(`${executeRecords?.[0]?.id || ''}`);
    }
  }, [chosenPipelineId, executeRecords]);

  const getRecordList = (p?: { pageNo: number; pageSize?: number }) => {
    return getExecuteRecords({
      pageNo: 1,
      pageSize: recordPaging.pageSize,
      branch,
      source: 'dice',
      pagingYmlNames,
      ...p,
    });
  };

  React.useEffect(() => {
    chosenPipelineId && updateSearch({ pipelineID: chosenPipelineId });
  }, [chosenPipelineId]);

  const renderBuildHistory = () => {
    if (!executeRecords?.length) {
      return <p>{i18n.t('common:No data')}</p>;
    }

    const columns: Array<ColumnProps<BUILD.ExecuteRecord>> = [
      {
        title: i18n.t('Version'),
        dataIndex: 'runIndex',
        width: 80,
        align: 'center',
        render: (runIndex: string, record: BUILD.ExecuteRecord) => (
          <span className="run-index">
            {record.triggerMode === 'cron' && <CustomIcon type="clock" />}
            {runIndex}
          </span>
        ),
      },
      {
        title: 'ID',
        dataIndex: 'id',
        width: 80,
        align: 'center',
      },
      {
        title: `${i18n.t('Commit')}ID`,
        dataIndex: 'commit',
        width: 96,
        render: (commitText: string) => <span> {(commitText || '').slice(0, 6)} </span>,
      },
      {
        title: i18n.t('Status'),
        dataIndex: 'status',
        width: 120,
        render: (status: string) => (
          <Tooltip title={ciStatusMap[status].text}>
            <span>
              <span className="nowrap">{ciStatusMap[status].text}</span>
              <Badge className="ml-1" status={ciStatusMap[status].status} />
            </span>
          </Tooltip>
        ),
      },
      {
        title: i18n.t('dop:Executor'),
        dataIndex: ['extra', 'runUser', 'name'],
        width: 120,
        align: 'center',
      },
      {
        title: i18n.t('Trigger time'),
        dataIndex: 'timeCreated',
        width: 200,
        render: (timeCreated: number) => moment(new Date(timeCreated)).format('YYYY-MM-DD HH:mm:ss'),
      },
    ];

    const { total, pageNo, pageSize } = recordPaging;
    const startIndex = total - pageSize * (pageNo - 1);
    const dataSource = map(executeRecords, (item, index) => {
      return { ...item, runIndex: '#'.concat(String(startIndex - index)) };
    });

    const setRowClassName = (record: BUILD.ExecuteRecord) => {
      return `${record.id}` !== `${chosenPipelineId}` ? 'build-history-tr' : 'selected-row font-medium';
    };

    return (
      <div className="build-history-wp">
        <div
          className="refresh-newest-btn flex  align-center"
          onClick={() => {
            getRecordList({ pageNo: 1 }).then((res) => {
              updater.recordTableKey((_prev: number) => _prev + 1);
              updater.chosenPipelineId(`${res?.[0]?.id || ''}`);
            });
          }}
        >
          <ErdaIcon className="hover" size="16" type="shuaxin" />
          {i18n.t('Fetch latest records')}
        </div>
        <Table
          key={`${recordTableKey}`}
          rowKey="runIndex"
          className="build-history-list"
          wrapperClassName="max-h-80"
          columns={columns}
          loading={getExecuteRecordsLoading}
          dataSource={dataSource}
          rowClassName={setRowClassName}
          pagination={{
            pageSize,
            total,
            current: pageNo,
            onChange: (_no: number, _size?: number) => getRecordList({ pageNo: _no, pageSize: _size }),
          }}
          onRow={({ id: targetPipelineID }) => ({
            onClick: () => {
              updater.chosenPipelineId(`${targetPipelineID}`);
            },
          })}
        />
      </div>
    );
  };

  return (isMobileInit ? pagingYmlNames : branch) ? (
    <Execute
      projectId={projectId}
      appId={appId}
      pipelineId={chosenPipelineId}
      titleOperation={
        <Popover
          placement="bottomRight"
          title={i18n.t('dop:Execution Records')}
          content={renderBuildHistory()}
          arrowPointAtCenter
          trigger="click"
        >
          <ErdaIcon fill="black-4" size="20" type="jsjl" className="mb-2 mr-1 cursor-pointer" />
        </Popover>
      }
    />
  ) : (
    <EmptyHolder relative />
  );
};

export default Pipeline;
