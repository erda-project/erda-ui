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
import { FileEditor } from 'common';
import { Button } from 'antd';
import { isValidJsonStr } from 'common/utils';
import { useUpdateEffect } from 'react-use';
import i18n from 'i18n';

interface IProps {
  slot?: React.ReactElement;
  configData: PIPELINE_CONFIG.ConfigItem[];
  updateConfig: (data: PIPELINE_CONFIG.ConfigItem[]) => Promise<any>;
  onChange?: (val: string) => void;
  onEditChange?: (isEdit: boolean) => void;
}

const convertData = (data: PIPELINE_CONFIG.ConfigItem[]) => {
  return (data || []).map((item) => ({
    key: item.key,
    encrypt: item.encrypt,
    comment: item.comment,
    value: item.value,
  }));
};

const TextEditConfig = (props: IProps) => {
  const { slot, configData, onChange, updateConfig, onEditChange } = props;
  const [value, setValue] = React.useState(JSON.stringify(convertData(configData), null, 2));

  React.useEffect(() => {
    setValue(JSON.stringify(convertData(configData), null, 2));
  }, [configData]);

  const _isValid = isValidJsonStr(value);

  const isUpdated = React.useMemo(
    () => !isValidJsonStr(value) || JSON.stringify(JSON.parse(value)) !== JSON.stringify(convertData(configData)),
    [value, configData],
  );

  useUpdateEffect(() => {
    onEditChange?.(isUpdated);
  }, [isUpdated]);

  useUpdateEffect(() => {
    _isValid && onChange?.(value);
  }, [value]);
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end py-2">{slot}</div>
      <div className="flex-1 overflow-auto">
        <FileEditor
          fileExtension="json"
          minLines={4}
          className="rounded border-all h-full overflow-auto"
          actions={{
            copy: true,
            format: true,
          }}
          onChange={(val: string) => {
            setValue(val);
          }}
          value={value}
        />
      </div>
      <div className={`mt-2 ${isUpdated ? 'flex flex-col' : 'hidden'}`}>
        {_isValid ? null : <span className="text-danger mb-1">{i18n.t('dop:JSON format error')}</span>}
        <div className="flex-h-center">
          <Button
            type="primary"
            className="mr-2"
            disabled={!_isValid}
            onClick={() => {
              updateConfig(JSON.parse(value));
            }}
          >
            {i18n.t('save')}
          </Button>
          <Button
            onClick={() => {
              setValue(JSON.stringify(convertData(configData), null, 2));
            }}
          >
            {i18n.t('revoke')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextEditConfig;
