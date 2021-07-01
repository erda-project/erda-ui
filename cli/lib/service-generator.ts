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

import fs from 'fs';
import { logSuccess, logInfo, logError } from './util/log';
import http from 'superagent';
import { walker } from './util/file-walker';
import { get, forEach, keys } from 'lodash';
import { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import { decode } from 'js-base64';

type ParamsType = 'query' | 'body' | 'path';

interface JSONSchema extends Omit<JSONSchema7, 'type'> {
  type: JSONSchema7TypeName | 'integer' | 'float' | 'double' | 'long';
}

interface ApiList {
  apiName: string;
  method: string;
  resType: string;
  parameters: string;
  resData: string;
}
const numberTypes = ['integer', 'float', 'double', 'number', 'long'];
let repository = '';
let username = '';
let swaggerFilePath = '';
let workDir = '.';

let swaggerData: {
  paths: {
    [p: string]: {
      [m: string]: object;
    };
  };
  definitions: {
    [p: string]: JSONSchema;
  };
};


const REG_SEARCH = /(AUTO\s*GENERATED)/g;
const REG_API = /((get|post|put|delete)[a-zA-Z]+):\s*{\n\s*api:\s*'(\/api(\/:?[a-zA-Z-]+)+)'/g;

const getBasicTypeData = (props: JSONSchema & {propertyName?: string}) => {
  const { type, properties = {}, items, required = [] } = props || {};
  let value;

  if (type === 'object') {
    const data: {[p: string]: string | object} = {};
    // eslint-disable-next-line guard-for-in
    for (const key in properties) {
      const pData = properties[key] as JSONSchema;
      const __key = required.includes(key) ? key : `${key}?`;
      data[__key] = getBasicTypeData({ ...pData, propertyName: key });
    }
    value = data;
  } else if (type === 'array' && items) {
    const itemsType = get(items, 'type');
    if (itemsType === 'object' || itemsType === 'array') {
      value = `Array<${formatJson(getSchemaData(items))}>`;
    } else {
      value = `${itemsType}[]`;
    }
  } else if (type === 'integer' || type === 'number') {
    value = 'number';
  } else {
    value = type;
  }
  return value;
};

const formatJson = (data: string | object) => {
  const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return jsonData.replace(/\\+n/g, '\n').replace(/"/g, '');
};

const getSchemaData: any = (schemaData: JSONSchema) => {
  const { $ref, type } = schemaData || {};
  let res;
  if ($ref) {
    const quoteList = $ref.split('/').slice(1);
    res = getSchemaData(get(swaggerData, quoteList));
  } else if (type) {
    res = getBasicTypeData(schemaData);
  } else {
    res = schemaData;
  }
  return res || {};
};

const getResponseType = (schemaData: JSONSchema) => {
  const { $ref } = schemaData || {};
  if ($ref) {
    const quoteList = $ref.split('/').slice(1);
    const _data = get(swaggerData, [...quoteList, 'properties', 'data']) || {};
    if (_data.type === 'object' && _data.properties?.total && _data.properties?.list) {
      return 'pagingList';
    } else {
      return _data.type;
    }
  } else {
    return schemaData?.type;
  }
};

const formatApiPath = (apiPath: string) => {
  const pathParams: {[p: string]: string} = {};
  const newApiPath = apiPath.replace(/(:[a-zA-Z]+)/g, (p: string) => {
    const pName = p.slice(1);
    pathParams[pName] = pName.toLocaleLowerCase().indexOf('id') >= 0 ? 'number' : 'string';
    return `<${pName}>`;
  });
  return {
    url: newApiPath,
    pathParams,
  };
};

const writeSteadyContent = (content: string, filePath: string) => {
  const lastIndex = content.indexOf('GENERATED');
  let steadyContent = content.slice();
  if (lastIndex) {
    steadyContent = content.slice(0, lastIndex + 9);
  }
  fs.writeFileSync(filePath, `${steadyContent}\r\n`, 'utf8');
};

const extractI18nFromFile = (
  content: string,
  filePath: string,
  isEnd: boolean,
  resolve: (value: void | PromiseLike<void>) => void,
) => {
  // only deal with suffix of '-api.ts'
  if (!filePath.endsWith('-api.ts') && !isEnd) {
    return;
  }

  if (content.match(REG_SEARCH)) {
    const apiList: ApiList[] = [];
    let appendContent = '';
    let typeContent = '';

    writeSteadyContent(content, filePath);

    let regRes = REG_API.exec(content);
    const typeFilePath = filePath.replace(/\/services\//, '/types/').replace(/-api\.ts/, '.d.ts');

    if (!fs.existsSync(typeFilePath)) {
      fs.writeFileSync(typeFilePath, `
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

// > AUTO GENERATED   
`, 'utf8');
    }
    while (regRes) {
      const typeFileContent = fs.readFileSync(typeFilePath, 'utf8');
      typeFileContent.match(REG_SEARCH) && writeSteadyContent(typeFileContent, typeFilePath);

      const [, apiName, method, _apiPath] = regRes;

      const { url: apiPath, pathParams } = formatApiPath(_apiPath);
      // get params from api path
      let parameters: {[p: string]: string} = { ...pathParams };

      // get params from 'parameters'
      forEach(get(swaggerData, ['paths', apiPath, method, 'parameters']), ({ name, type, in: paramsIn, schema, required }: {
        name: string; type: string; in: ParamsType; schema: JSONSchema; required?: boolean;
      }) => {
        if (paramsIn === 'query') {
          parameters[`${name}${required ? '' : '?'}`] = numberTypes.includes(type) ? 'number' : type;
        } else if (paramsIn === 'path') {
          parameters[name] = numberTypes.includes(type) ? 'number' : type;
        } else {
          parameters = {
            ...parameters,
            ...(getSchemaData(schema) || {}),
          };
        }
      });

      const _schemaData = get(swaggerData, ['paths', apiPath, method, 'responses', '200', 'schema']);

      const resType = getResponseType(_schemaData);
      const fullData = getSchemaData(_schemaData) || {};

      const responseData = (resType === 'pagingList' ? fullData.data?.list : (fullData.data || fullData['data?'])) || {};

      const _resData: string = JSON.stringify(responseData, null, 2);
      let resData = formatJson(_resData);

      if (_resData.startsWith('"Array<')) {
        resData = formatJson(_resData.slice(7, _resData.length - 2));
      }

      apiList.push({
        apiName,
        method,
        parameters: formatJson(parameters),
        resData,
        resType,
      });
      regRes = REG_API.exec(content);
    }

    forEach(apiList, ({ apiName, parameters, resData, resType }) => {
      let pType = '{}';
      let bType = 'RAW_RESPONSE';
      if (resData !== '{}') {
        if (resType === 'pagingList') {
          bType = `IPagingResp<T_${apiName}_item>`;
        } else if (resType === 'array') {
          bType = `T_${apiName}_item[]`;
        } else {
          bType = `T_${apiName}_data`;
        }

        typeContent += `
interface T_${apiName}_${['array', 'pagingList'].includes(resType) ? 'item' : 'data'} ${resData}\n`;
      }
      if (parameters !== '{}') {
        typeContent += `
interface T_${apiName}_params ${parameters}\n`;
        pType = `T_${apiName}_params`;
      }

      appendContent += `
export const ${apiName} = apiCreator<(p: ${pType}) => ${bType}>(apis.${apiName});
        `;
    });

    fs.appendFileSync(typeFilePath, typeContent, 'utf8');
    fs.appendFileSync(filePath, appendContent, 'utf8');
    typeContent = '';
    appendContent = '';
  }

  if (!isEnd) {
    return;
  }

  if (isEnd) {
    logSuccess('service data is updated, bye 👋');
    resolve();
  }
};

const getSwaggerData = () => {
  return http.get(`https://api.github.com/repos/${username}/${repository}/contents/${swaggerFilePath}`)
    .set('content-type', 'application-json')
    .set('User-Agent', '')
    .then((response) => {
      logInfo('get swagger data successfully!');
      const content = decode(response?.body?.content);
      return content ? JSON.parse(content) : '';
    })
    .catch((err) => {
      logError('fail to get swagger data: ', err);
      return false;
    });
};

const extractHandle = async () => {
  await new Promise<void>((resolve) => {
    walker({
      root: workDir,
      dealFile: (...args) => {
        extractI18nFromFile.apply(null, [...args, resolve]);
      },
    });
  });
};

const generate = async () => {
  swaggerData = await getSwaggerData();
  if (keys(swaggerData?.paths)?.length) {
    extractHandle();
  } else {
    logError('It is an empty swagger!');
    process.exit(1);
  }
};

export default async ({ workDir: _workDir, repository: _repository, username: _username, filePath: _filePath }: {
  workDir: string;
  repository: string;
  username: string;
  filePath: string;
}) => {
  try {
    workDir = _workDir || process.cwd();
    repository = _repository || 'erda';
    username = _username || 'erda-project';
    swaggerFilePath = _filePath || 'pkg/swagger/oas3/testdata/swagger_all.json';

    generate();
  } catch (error) {
    logError(error);
  }
};
