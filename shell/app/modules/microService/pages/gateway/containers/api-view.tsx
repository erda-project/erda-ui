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

import React, { useState, useEffect, Fragment } from 'react';
import { Row, Col, Tooltip } from 'app/nusi';
import { map, groupBy, Dictionary, get, values, isEmpty } from 'lodash';
import { Copy } from 'common';
import './api-view.scss';

const paramsTitleMap = {
  path: 'Path Parameters',
  query: 'Query Parameters',
  header: 'Header Parameters',
  body: 'Request Body',
  formData: 'Request Body',
};

const bodyContentType = {
  formData: 'application/x-www-form-urlencoded',
  body: 'application/json',
};

const methodColorMap = {
  get: 'green',
  post: 'blue',
  put: 'orange',
  delete: 'red',
  patch: 'purple',
};

interface IExpandItem {
  properties: Record<string, any>;
  type: string;
  title: string;
  items: {
    properties: Record<string, any>;
    title: string;
  };
}
const rootBodyPath = {
  title: 'Request Body',
  name: 'Request Body',
  params: 'root',
  type: 'object',
  key: 0,
  data: {},
};
const noExpandTypes = ['array[string]', 'array[number]', 'array[boolean]', 'null'];
const RenderBody = ({
  root,
  properties = {},
  dataType: dType,
}: {
  root: string;
  properties?: { [key: string]: any };
  dataType: string;
}) => {
  const [bodyPath, setBodyPath] = useState([
    {
      ...rootBodyPath,
      title: root || rootBodyPath.title,
      name: root || rootBodyPath.name,
    },
  ]);
  const [bodyData, setBodyData] = useState({});
  const [dataType, setDataType] = useState('object');
  useEffect(() => {
    setBodyData(properties);
    setDataType(dType);
  }, [properties, dType]);
  const expand = (params: string, Item: IExpandItem) => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { properties: property, type, title, items, description, ...rest } = Item;
    const rsetParmas = get(values(rest), '[0].properties');
    const { type: paramsType } = generatorType(params, { type, items });
    if (noExpandTypes.includes(paramsType)) {
      return;
    }
    // const data = JSON.parse(stringifyPro(type === 'array' ? items.properties : properties || rsetParmas, 2));
    const data = type === 'array' ? items.properties : property || rsetParmas;
    setDataType(type);
    setBodyData(data);
    setBodyPath([
      ...bodyPath,
      {
        title: params,
        name: type === 'array' ? params : title,
        params,
        type,
        key: bodyPath.length,
        data,
      },
    ]);
  };
  const generatorType = (params: string, item: { [k: string]: any; type: string; items: Record<string, any> }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, items = {}, enum: enums = [], properties: property, description, ...rest } = item;
    const rsetParmas = get(values(rest), '[0].properties') || {};
    let typeStr = type;
    let allowExpand = true;
    if (type === 'array') {
      allowExpand = !bodyPath.some((t) => t.data === items.properties);
      if (items.title) {
        typeStr = items.title;
      } else {
        const s = items.type;
        typeStr = s ? `array[${s}]` : 'array';
        if (!items.properties) {
          allowExpand = false;
        }
      }
      // if (isString (items.properties) && items.properties.indexOf('Circular reference') !== -1) {
      //   typeStr = 'null';
      // }
    } else if (type === 'object') {
      typeStr = params;
      allowExpand = !isEmpty(property || rsetParmas);
    }
    if (enums.length) {
      typeStr = `enum: ${JSON.stringify(enums)}`;
    }
    return { type: typeStr, allowExpand };
  };
  const renderBody = (data: any = {}) => {
    return map(data, (paramsProps, params) => {
      let paramsType = paramsProps.type;
      let showExpand = true;
      if (['object', 'array'].includes(paramsProps.type)) {
        const { type, allowExpand } = generatorType(params, paramsProps);
        paramsType = type;
        showExpand = allowExpand;
      }
      return (
        <Row type="flex" key={params} className="params-row bb mb-1 ml-5">
          <Col span={6}>
            <div className="param-key nowrap">{params}</div>
          </Col>
          <Col span={6}>
            <div className="param-type nowrap">
              {['object', 'array'].includes(paramsProps.type) && showExpand ? (
                <span
                  className={`mb-3 nowrap ${noExpandTypes.includes(paramsType) ? '' : 'highlight '}`}
                  onClick={() => {
                    expand(params, paramsProps);
                  }}
                >
                  {paramsType}
                </span>
              ) : (
                paramsType
              )}
            </div>
          </Col>
          <Col span={12}>
            <Tooltip title={paramsProps.description} placement={'topLeft'}>
              <div className="param-description nowrap">{paramsProps.description || ''}</div>
            </Tooltip>
          </Col>
        </Row>
      );
    });
  };

  const changeRoute = ({ key, type, data }: { key: number; type: string; data: any }, jump: boolean) => {
    if (!jump) {
      return;
    }
    const mewpath = bodyPath.filter((item) => item.key <= key);
    const a = mewpath.map((t) => t.params);
    a.shift();
    const propertie = key === 0 ? properties : data;
    setDataType(type);
    setBodyPath(mewpath);
    setBodyData(propertie);
  };

  const renderBodyPath = () => {
    return bodyPath.map((item, index) => {
      return (
        <Fragment key={String(index)}>
          <span
            className="highlight mb-3 nowrap"
            key={item.params}
            onClick={() => {
              changeRoute(item, index !== bodyPath.length - 1);
            }}
          >
            {item.title}
          </span>
          {index === bodyPath.length - 1 ? null : <span className="separator">/</span>}
        </Fragment>
      );
    });
  };

  return (
    <>
      <div className="api-router">{renderBodyPath()}</div>
      {dataType ? <p className="tips">if type is: {dataType}</p> : null}
      {renderBody(bodyData)}
    </>
  );
};

const renderCommonParams = (params: any[] = []) => {
  return (
    <>
      {params.map((item: any) => {
        const subType = item.items ? `[${item.items.type}]` : null;
        const { name, required, type, format, description } = item;
        return (
          <Row type="flex" key={name} className="params-row bb mb-1">
            <Col span={6}>
              <div className="param-key">
                {name}&nbsp;{required ? '(required)' : null}
              </div>
            </Col>
            <Col span={6}>
              <div className="param-type">
                {type || 'object'}
                {format ? `(${format})` : null}
                {subType}
              </div>
            </Col>
            <Col span={12}>
              <div className="param-description">{description}</div>
            </Col>
          </Row>
        );
      })}
    </>
  );
};

const ApiView = ({ api }: { api: any }) => {
  const parametersMap: Dictionary<any[]> = groupBy(api.parameters, 'in');
  const { schema: bodySchema = {} } = parametersMap.body ? parametersMap.body[0] || {} : {};
  const renderParameters = (paramMap: Dictionary<any[]>) => {
    return map(paramMap, (params, paramsType) => {
      return (
        <Fragment key={paramsType}>
          <div className="api-properties-title">{paramsTitleMap[paramsType]}</div>
          {Object.keys(bodyContentType).includes(paramsType) ? (
            <div className="mb-8">
              <p className="tips">
                Request payload in application/json, application/x-www-form-urlencoded, or application/xml
              </p>
              <p className="tips mb-4">format.{bodyContentType[paramsType] || 'application/json'}</p>
              {paramsType === 'body' ? (
                <RenderBody
                  root="Request Body"
                  dataType={bodySchema.type || 'object'}
                  properties={bodySchema.properties || bodySchema.items.properties || {}}
                />
              ) : (
                renderCommonParams(params)
              )}
            </div>
          ) : (
            <div className="mb-5">{renderCommonParams(params)}</div>
          )}
        </Fragment>
      );
    });
  };
  return (
    <div key={api._key} id={api._key} className="api-view">
      <div className="api-view-title colorful-bg">
        <span className={`api-method ${methodColorMap[api._method]}`}>{api._method.toUpperCase()}</span>
        <span className="api-path">
          <Copy>{api._path}</Copy>
        </span>
        <div className="api-desc nowrap mb-4">
          <Tooltip placement="bottom" title={api.description}>
            {api.description}
          </Tooltip>
        </div>
      </div>
      <div className="api-view-body">
        {renderParameters(parametersMap)}
        <div className="api-properties-title">Responses</div>
        <div className="mb-8">
          {map(api.responses, (resp, code) => {
            const currentResp = { ...resp };
            const status = parseInt(code, 10);
            if (status === 200 && resp.schema) {
              const { properties = {}, items } = resp.schema;
              if (resp.schema.type === 'object') {
                if (!items) {
                  currentResp.schema.properties = {
                    ...properties,
                  };
                }
              } else if (resp.schema.type === 'array') {
                if (!items) {
                  currentResp.schema.items = {
                    properties: {},
                  };
                }
              }
            }
            return (
              <div key={code} className="api-section api-resp">
                <Row type="flex" justify="space-between" align="top">
                  <Col span={6}>
                    <div className="key">{code}</div>
                  </Col>
                  {status === 200 && currentResp.schema && ['object', 'array'].includes(currentResp.schema.type) ? (
                    <Col span={24}>
                      <RenderBody
                        dataType={currentResp.schema.type}
                        root="Response Body"
                        properties={currentResp.schema.properties || currentResp.schema.items.properties}
                      />
                    </Col>
                  ) : (
                    <Col span={18}>
                      <div>{currentResp.description}</div>
                    </Col>
                  )}
                </Row>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ApiView;
