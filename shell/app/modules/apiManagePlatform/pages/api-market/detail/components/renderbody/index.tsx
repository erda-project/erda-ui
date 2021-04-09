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
import { get, map, isEmpty, values } from 'lodash';
import { Col, Row, Tooltip } from 'nusi';
import './index.scss';

interface IExpandItem {
  properties: Record<string, any>;
  description: string;
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

const noExpandTypes = [
  'array[string]',
  'array[number]',
  'array[boolean]',
  'null',
];

const RenderBody = ({ root, properties = {} }: {root: string; properties?: {[key: string]: any}; dataType: string}) => {
  const [bodyPath, setBodyPath] = useState([{
    ...rootBodyPath,
    title: root || rootBodyPath.title,
    name: root || rootBodyPath.name,
  }]);
  const [bodyData, setBodyData] = useState({});
  const [dataType, setDataType] = useState('object');

  useEffect(() => {
    setBodyData(properties);
    setDataType(dataType);
  }, [properties, dataType]);

  const expand = (params: string, Item: IExpandItem) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { properties: property, type, title, items, description, ...rest } = Item;
    const restParams = get(values(rest), '[0].properties');
    const { type: paramsType } = generatorType(params, { type, items });
    if (noExpandTypes.includes(paramsType)) {
      return;
    }
    // const data = JSON.parse(stringifyPro(type === 'array' ? items.properties : properties || restParams, 2));
    const data = type === 'array' ? items.properties : property || restParams;
    setDataType(type);
    setBodyData(data);
    setBodyPath([...bodyPath, {
      title: params,
      name: type === 'array' ? params : title,
      params,
      type,
      key: bodyPath.length,
      data,
    }]);
  };
  const generatorType = (params: string, item: {[k: string]: any; type: string; items: Record<string, any>}) => {
    const { type, items = {}, enum: enums = [], properties: property, description, ...rest } = item;
    const restParams = get(values(rest), '[0].properties') || {};
    let typeStr = type;
    let allowExpand = true;
    if (type === 'array') {
      allowExpand = !bodyPath.some(t => t.data === items.properties);
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
      allowExpand = !isEmpty(property || restParams);
    }
    if (enums.length) {
      typeStr = `enum: ${JSON.stringify(enums)}`;
    }
    return { type: typeStr, allowExpand };
  };
  const renderBody = (property: any = {}) => {
    return map(property, (paramsProps, params) => {
      let paramsType = paramsProps.type;
      let showExpand = true;
      if (['object', 'array'].includes(paramsProps.type)) {
        const { type, allowExpand } = generatorType(params, paramsProps);
        paramsType = type; showExpand = allowExpand;
      }
      return (
        <Row type="flex" key={params} className="bold-400 nowrap color-text border-bottom pt8 pb8">
          <Col span={6}>
            <div className="param-key nowrap">
              {params}
            </div>
          </Col>
          <Col span={6}>
            <div className="param-type nowrap">
              {
                ['object', 'array'].includes(paramsProps.type) && showExpand ? (
                  <span
                    className={`mb12 nowrap ${noExpandTypes.includes(paramsType) ? '' : 'fake-link '}`}
                    onClick={() => {
                      expand(params, paramsProps);
                    }}
                  >
                    {paramsType}
                  </span>
                ) : paramsType
              }
            </div>
          </Col>
          <Col span={12}>
            <Tooltip title={paramsProps.description} placement="topLeft">
              <div className="param-description nowrap">
                {paramsProps.description || ''}
              </div>
            </Tooltip>
          </Col>
        </Row>
      );
    });
  };

  const changeRoute = ({ key, type, data }: {key: number; type: string; data: any}, jump: boolean) => {
    if (!jump) {
      return;
    }
    const newPath = bodyPath.filter(item => item.key <= key);
    const a = newPath.map(t => t.params);
    a.shift();
    const property = key === 0 ? properties : data;
    setDataType(type);
    setBodyPath(newPath);
    setBodyData(property);
  };

  const renderBodyPath = () => {
    return bodyPath.map((item, index) => {
      return (
        <Fragment key={String(index)}>
          <span
            className="fake-link mb12 nowrap"
            key={item.params}
            onClick={() => {
              changeRoute(item, index !== bodyPath.length - 1);
            }}
          >{item.title}
          </span>
          {
            index === bodyPath.length - 1 ? null : <span className="separator">/</span>
          }
        </Fragment>
      );
    });
  };

  return (
    <>
      <div className="api-router mb12">
        {
          renderBodyPath()
        }
      </div>
      {
        dataType ? <p className="tips">if type is: {dataType}</p> : null
      }
      {renderBody(bodyData)}
    </>
  );
};
export default RenderBody;
