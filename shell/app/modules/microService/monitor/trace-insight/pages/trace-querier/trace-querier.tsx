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
import { map as _map, pickBy } from 'lodash';
import { Row, Col, Input, Select, Button, Tabs, Form } from 'app/nusi';
import { Copy, KeyValueEditor, IF } from 'common';
import { regRules, notify, qs } from 'common/utils';
import CommonPanel from './trace-common-panel';
import TraceHistoryList from './trace-history-list';
import RequestStatusViewer from './trace-status-viewer';
import constants from './constants';
import { useLoading } from 'app/common/stores/loading';
import routeInfoStore from 'app/common/stores/route';
import traceQuerierStore from 'trace-insight/stores/trace-querier';
import { useEffectOnce } from 'react-use';
import i18n from 'i18n';
import './trace-querier.scss';

const { HTTP_METHOD_LIST, MAX_BODY_LENGTH, MAX_URL_LENGTH } = constants;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Item: FormItem } = Form;
const { banFullWidthPunctuation, url: urlRule } = regRules;

const TraceInsightQuerier = ({
  form,
}: any) => {
  const [
    requestTraceParams,
    traceHistoryList,
    currentTraceRequestId,
    traceStatusDetail,
    traceDetailContent,
    spanDetailContent,
  ] = traceQuerierStore.useStore((s) => [
    s.requestTraceParams,
    s.traceHistoryList,
    s.currentTraceRequestId,
    s.traceStatusDetail,
    s.traceDetailContent,
    s.spanDetailContent,
  ]);
  const urlQuery = routeInfoStore.useStore((s) => s.query);
  const [isTraceDetailContentFetching, isTraceHistoryFetching, isRequestTraceFetching] = useLoading(traceQuerierStore, ['getTraceDetailContent', 'getTraceHistoryList', 'requestTrace']);

  const {
    requestTrace,
    getSpanDetailContent,
    getTraceHistoryList,
    getTraceDetail,
    getTraceDetailContent,
    getTraceStatusDetail,
    cancelTraceStatus,
  } = traceQuerierStore.effects;

  const {
    setRequestTraceParams,
    setCurrentTraceRequestId,
    clearTraceStatusDetail,
    clearCurrentTraceRequestId,
    clearRequestTraceParams,
  } = traceQuerierStore.reducers;


  useEffectOnce(() => {
    getTraceHistoryList();
    return () => {
      clearRequestTraceParams();
      clearCurrentTraceRequestId();
      clearTraceStatusDetail();
    };
  });

  const { method, url, body, query, header } = requestTraceParams;
  const queryStr = qs.stringify(query);
  const { getFieldDecorator, validateFields } = form;
  const { requestId } = urlQuery;

  const [activeTab, setActiveTab] = React.useState('1');
  const [traceRecords, setTraceRecords] = React.useState({});

  let paramsEditor: any;
  let headersEditor: any;

  React.useEffect(() => {
    requestId && setActiveTab('2');
  }, [requestId]);

  React.useEffect(() => {
    requestId && getTraceDetailContent({ requestId, needReturn: true }).then((content: any) => {
      setTraceRecords(content);
    });
  }, [getTraceDetailContent, requestId]);

  const handleSetRequestTraceParams = (payload: any) => {
    validateFields((err: any) => {
      if (!err) {
        const params = { ...payload };
        const { query: preQuery, url: preUrl } = params;
        if (preUrl) {
          const queryMap = qs.parseUrl(preUrl).query;
          params.query = { ...preQuery, ...pickBy(queryMap, (v, k) => v && k) };
        }
        setRequestTraceParams({ ...requestTraceParams, ...params });
      }
    });
  };

  const handleRequestTrace = () => {
    validateFields((err: any) => {
      if (err) {
        notify('warning', i18n.t('microService:param-error-check'));
        return;
      }

      const payload: any = {};
      // 适应 AntD Tabs 组件 Tab Content 惰性加载取不到 ref 的问题
      if (paramsEditor) {
        payload.query = paramsEditor.getEditData();
      }

      if (headersEditor) {
        payload.header = headersEditor.getEditData();
      }
      handleSetRequestTraceParams(payload);
      requestTrace();
    });
  };

  const renderMetaViewer = () => {
    return (
      <div className="meta-viewer">
        {
          !url
            ? <p>{i18n.t('microService:current no request')}</p>
            : (
              <p className="meta-viewer-copy">
                <Copy>{ url }</Copy>
              </p>
            )
        }
      </div>
    );
  };

  const renderUrlEditor = () => {
    const selectBefore = getFieldDecorator('method', {
      rules: [
        { required: true, message: i18n.t('microService:this item is required') },
      ],
      initialValue: method,
    })(
      <Select
        style={{ width: 110 }}
        onSelect={(value) => {
          handleSetRequestTraceParams({ method: value });
        }}
      >
        {
          _map(HTTP_METHOD_LIST, (item) => (
            <Option value={item} key={item}>{ item }</Option>
          ))
        }
      </Select>,
    );

    return (
      <div className="url-editor">
        <Row gutter={10}>
          <Col span={21}>
            <FormItem>
              { getFieldDecorator('url', {
                rules: [
                  { required: true, message: i18n.t('microService:this item is required') },
                  urlRule,
                ],
                initialValue: `${url}${queryStr ? `?${queryStr}` : ''}`,
              })(
                <Input
                  addonBefore={selectBefore}
                  placeholder={i18n.t('microService|please enter a legal url, length limit: ', { nsSeparator: '|' }) + MAX_URL_LENGTH}
                  maxLength={MAX_URL_LENGTH}
                  onBlur={(e) => { handleSetRequestTraceParams({ url: e.target.value }); }}
                />,
              )}
            </FormItem>
          </Col>
          <Col span={3}>
            <Button
              type="primary"
              loading={isRequestTraceFetching}
              onClick={handleRequestTrace}
            >
              {i18n.t('microService:request')}
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  const renderRequestEditor = () => {
    return (
      <Tabs className="request-editor" defaultActiveKey="1">
        <TabPane tab="Params" key="1">
          <Form className="request-edit-params-form">
            <KeyValueEditor
              isNeedTextArea={false}
              tableProps={{
                size: 'default',
              }}
              form={form}
              dataSource={query}
              ref={(ref) => { paramsEditor = ref; }}
              onChange={(data: any) => {
                setRequestTraceParams({
                  ...requestTraceParams,
                  query: data,
                  url: `${qs.parseUrl(url).url}`,
                });
              }}
            />
          </Form>
        </TabPane>
        <TabPane tab="Headers" key="2">
          <Form className="request-edit-params-form">
            <KeyValueEditor
              tableProps={{
                size: 'default',
              }}
              form={form}
              dataSource={header}
              ref={(ref) => { headersEditor = ref; }}
            />
          </Form>
        </TabPane>
        <TabPane tab="Body" key="3">
          <FormItem>
            { getFieldDecorator('body', {
              rules: [banFullWidthPunctuation],
              initialValue: body,
            })(<TextArea
              className="request-edit-body-form"
              autoSize={{ minRows: 8, maxRows: 12 }}
              maxLength={MAX_BODY_LENGTH}
              placeholder={i18n.t('microService|please enter body, length limit:', { nsSeparator: '|' }) + MAX_BODY_LENGTH}
              onChange={(e) => {
                handleSetRequestTraceParams({ body: e.target.value });
              }}
            />)}
          </FormItem>
        </TabPane>
      </Tabs>
    );
  };

  const renderStatusList = () => {
    return (
      <CommonPanel
        title={
          <div className="flex-box">
            <h3 className="trace-common-panel-title bold-500">{i18n.t('microService:transactions information')}</h3>
            <IF check={requestTraceParams.responseCode} >
              <div className="response-code">{`${i18n.t('microService:request response status')}：${requestTraceParams.responseCode}`}</div>
            </IF>
          </div>

      }
        className="trace-status-list-ct"
      >
        <RequestStatusViewer
          traceStatusDetail={traceStatusDetail}
          cancelTraceStatus={cancelTraceStatus}
          spanDetailContent={spanDetailContent}
          traceDetailContent={traceDetailContent}
          isTraceDetailContentFetching={isTraceDetailContentFetching}
          getSpanDetailContent={getSpanDetailContent}
        />
      </CommonPanel>
    );
  };

  return (
    <div>
      <Row className="trace-querier" gutter={20}>
        <Col span={6}>
          <CommonPanel title={i18n.t('microService:query records')} className="history-status-list-ct">
            <TraceHistoryList
              dataSource={traceHistoryList}
              isFetching={isTraceHistoryFetching}
              currentTraceRequestId={currentTraceRequestId}
              getTraceHistoryList={getTraceHistoryList}
              getTraceDetail={getTraceDetail}
              getTraceStatusDetail={getTraceStatusDetail}
              setCurrentTraceRequestId={setCurrentTraceRequestId}
              setRequestTraceParams={setRequestTraceParams}
              clearTraceStatusDetail={clearTraceStatusDetail}
              clearCurrentTraceRequestId={clearCurrentTraceRequestId}
              clearRequestTraceParams={clearRequestTraceParams}
            />
          </CommonPanel>
        </Col>
        <Col span={18}>
          <CommonPanel >
            <React.Fragment>
              { renderMetaViewer() }
              { renderUrlEditor() }
              { renderRequestEditor() }
            </React.Fragment>
          </CommonPanel>
          { renderStatusList() }
        </Col>
      </Row>
    </div>
  );
};

export default Form.create()(TraceInsightQuerier);
