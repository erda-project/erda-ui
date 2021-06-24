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

import { isEmpty, isEqual, map } from 'lodash';
import * as React from 'react';
import moment from 'moment';
import { Form, Input, InputNumber, Row, Col, Button, DatePicker, Select, Radio } from 'app/nusi';
import { valiAssociate } from 'microService/monitor/monitor-common/utils';
import { FormInstance } from 'core/common/interface';
import i18n from 'i18n';

const { Option } = Select;
const FormItem = Form.Item;

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

interface IProps {
  [pro: string]: any;
  lastSearchParams: ISearchParam;
  services: any;
  terminusApp: any;
  startTimeMs: number;
  endTimeMs: number;
  form: FormInstance;
  setSearchParam: (args?: any) => Promise<any>;
  setTimeMs: (arg1: string, arg2?: any) => Promise<any>;
}
interface IState {
  searchParam: ISearchParam;
  formTraceId?: any;
}
interface ISearchParam {
  [pro: string]: any;
  sortType: string;
  pageNo: number;
  pageSize: number;
}

class TraceFilterForm extends React.Component<IProps, IState> {
  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    const { lastSearchParams } = nextProps;
    const { searchParam } = prevState;
    if (!isEmpty(lastSearchParams) && !isEqual(searchParam, lastSearchParams)) {
      return { searchParam: lastSearchParams };
    }
    return null;
  }

  state = {
    formTraceId: '',
    searchParam: {
      sortType: '',
      pageNo: 1,
      pageSize: 20,
    },
  };

  formRef = React.createRef<FormInstance>();

  // componentWillReceiveProps({ lastSearchParams }: IProps) {
  //   const { searchParam } = this.state;
  //   if (!isEmpty(lastSearchParams) && !isEqual(searchParam, lastSearchParams)) {
  //     this.setState({ searchParam: lastSearchParams });
  //   }
  // }

  changeSortMode = (e: any) => {
    const sortType = e.target.value;
    this.changeSearchParam({ sortType });
  };

  clickSortMode = (e: any) => {
    const sortType = e.target.value;
    const { searchParam } = this.state;
    if (sortType === searchParam.sortType) {
      // 已选中的，取消选择
      this.changeSearchParam({ sortType: '' });
    }
  };

  changeSearchParam = (params: object) => {
    this.setState(
      {
        searchParam: {
          ...this.state.searchParam,
          ...params,
          pageNo: 1,
        },
      },
      () => {
        this.setSearchParam();
      },
    );
  };

  setSearchParam = () => {
    this.props.setSearchParam(this.state.searchParam);
  };

  setStartTimeMs = (time: moment.Moment) => {
    this.props.setTimeMs('startTimeMs', time.valueOf());
  };

  setEndTimeMs = (time: moment.Moment) => {
    this.props.setTimeMs('endTimeMs', time.valueOf());
  };

  handleGetTraceList = (values: any) => {
    const { startTimeMs: oriStartTimeMs, endTimeMs: oriEndTimeMs, ...restValues } = values;
    const startTimeMs = moment(oriStartTimeMs).valueOf();
    const endTimeMs = moment(oriEndTimeMs).valueOf();

    const formatValues = {
      startTimeMs,
      endTimeMs,
      ...restValues,
    };
    this.changeSearchParam(formatValues);
  };

  range = (start: number, end: number) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  render() {
    const { services, terminusApp, startTimeMs, endTimeMs } = this.props;
    const terminusAppInit = typeof terminusApp === 'string' ? terminusApp : i18n.t('microService:all');
    const { formTraceId, searchParam } = this.state;
    const searchIdOnly = !!formTraceId;
    const { terminusApp: lastTerminusApp, path, statusCode, duration, traceId } = searchParam as any;
    const form = this.formRef.current;

    const fileds = [
      [
        {
          label: i18n.t('microService:module'),
          name: 'terminusApp',
          initialValue: lastTerminusApp || terminusAppInit,
          rules: [{ required: true, message: i18n.t('microService:the module name cannot be empty') }],
          children: (
            <Select disabled={searchIdOnly}>
              {map(services, (service, index) => {
                return (
                  <Option key={index} value={service}>
                    {service}
                  </Option>
                );
              })}
            </Select>
          ),
        },
        {
          label: i18n.t('microService:start time'),
          name: 'startTimeMs',
          initialValue: moment(startTimeMs),
          rules: [
            {
              validator: valiAssociate({
                form,
                ids: ['endTimeMs'],
                valiFn: (value: any, { endTimeMs: newEndTimeMs }: any) => {
                  return moment(value).valueOf() < moment(newEndTimeMs).valueOf();
                },
                errorMsg: i18n.t('microService:start time cannot be greater than end time'),
              }),
            },
          ],
          children: (
            <DatePicker
              disabled={searchIdOnly}
              className="full-width"
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={i18n.t('microService:please choose time')}
              onChange={this.setStartTimeMs}
              disabledDate={(current) => moment().isBefore(current)}
            />
          ),
        },
        {
          label: i18n.t('microService:end time'),
          name: 'endTimeMs',
          initialValue: moment(endTimeMs),
          rules: [
            {
              validator: valiAssociate({
                form,
                ids: ['startTimeMs'],
                valiFn: (value: any, { startTimeMs: newStartTimeMs }: any) => {
                  return moment(value).valueOf() > moment(newStartTimeMs).valueOf();
                },
                errorMsg: i18n.t('microService:end time cannot be less than the start time'),
              }),
            },
          ],
          children: (
            <DatePicker
              disabled={searchIdOnly}
              className="full-width"
              // showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={i18n.t('microService:please choose time')}
              onChange={this.setEndTimeMs}
              disabledDate={(current) => moment().isBefore(current)}
              showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            />
          ),
        },
      ],
      [
        {
          label: 'path',
          name: 'path',
          initialValue: path,
          children: <Input disabled={searchIdOnly} />,
        },
        {
          label: i18n.t('microService:status code'),
          name: 'statusCode',
          initialValue: statusCode,
          children: <Input disabled={searchIdOnly} />,
        },
        {
          label: `${i18n.t('microService:duration')}(ms)>=`,
          name: 'duration',
          initialValue: duration,
          children: (
            <InputNumber
              disabled={searchIdOnly}
              className="full-width"
              placeholder={i18n.t('microService:please enter the duration')}
              min={0}
            />
          ),
        },
      ],
      [
        {
          label: 'trace id',
          name: 'traceId',
          initialValue: traceId,
          getValueFromEvent: (e) => {
            const { value } = e.target;
            this.setState({
              formTraceId: value,
            });
            return value;
          },
          children: <Input />,
        },
        {
          wrapperCol: { span: 24 },
          className: 'text-right',
          children: (
            <Button type="primary" size="large" htmlType="submit">
              {i18n.t('microService:search for')}
            </Button>
          ),
        },
      ],
    ];

    const {
      searchParam: { sortType },
    } = this.state;

    return (
      <div>
        <Form ref={this.formRef} className="trace-filter-form" onFinish={(e) => this.handleGetTraceList(e)}>
          {map(fileds, (row, index) => (
            <Row key={index}>
              {map(row, ({ children, ...itemProps }, i) => (
                <Col key={i} span={8}>
                  <FormItem {...formItemLayout} {...itemProps}>
                    {children}
                  </FormItem>
                </Col>
              ))}
            </Row>
          ))}
        </Form>
        <div className="sort-wrap">
          <RadioGroup onChange={this.changeSortMode} value={sortType}>
            <RadioButton value="start_time_desc" onClick={this.clickSortMode}>
              {i18n.t('microService:duration descending')}
            </RadioButton>
            <RadioButton value="start_time_asc" onClick={this.clickSortMode}>
              {i18n.t('microService:time ascending')}
            </RadioButton>
            <RadioButton value="resp_time_desc" onClick={this.clickSortMode}>
              {i18n.t('microService:duration descending')}
            </RadioButton>
            <RadioButton value="resp_time_asc" onClick={this.clickSortMode}>
              {i18n.t('microService:duration ascending')}
            </RadioButton>
          </RadioGroup>
        </div>
      </div>
    );
  }
}

export default TraceFilterForm;
