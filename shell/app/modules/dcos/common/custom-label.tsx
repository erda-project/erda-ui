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
import { Input, Button } from 'app/nusi';
import { isString, isEmpty, remove, find, some } from 'lodash';
import { useUnmount } from 'react-use';
import i18n from 'i18n';
import './custom-label.scss';
import { Close as IconClose } from '@icon-park/react';

interface IProps {
  value?: string[] | string;
  labelName?: string;
  onChange?: (data: string[]) => void;
}
const emptyFun = () => {};
const emptyArr = [] as string[];
export const CustomLabel = React.forwardRef(
  ({ value = emptyArr, onChange = emptyFun, labelName = i18n.t('dcos:add label') }: IProps, ref) => {
    const [labels, setLabels] = React.useState([] as string[]);
    const [showInput, setShowInput] = React.useState(false);
    const [inputVal, setInputVal] = React.useState(undefined);
    const inputRef = React.useRef(null);
    React.useEffect(() => {
      const l = isEmpty(value) ? [] : isString(value) ? value.split(',') : value;
      setLabels(l);
    }, [value]);

    useUnmount(() => {
      setInputVal(undefined);
      setShowInput(false);
      setLabels([]);
    });

    React.useEffect(() => {
      const curRef = inputRef && (inputRef.current as any);
      if (showInput && curRef) {
        curRef.focus();
      }
    }, [inputRef, showInput]);

    const deleteLabel = (label: string) => {
      const labelArr = [...labels];
      remove(labelArr, (item) => item === label);
      onChange(labelArr);
    };

    const addLabel = (e: any) => {
      const label = e.target.value;
      label && label.trim();
      if (label) {
        const exitLabel = find(labels, (item) => item === label);
        !exitLabel && onChange([...labels, label]);
      }
      toggleShowInput();
      setInputVal(undefined);
    };
    const toggleShowInput = () => {
      setShowInput(!showInput);
    };
    return (
      <div ref={ref} className="custom-label-comp">
        {labels.map((item, i) => {
          return (
            <span key={`${item}_${String(i)}`} className={'tag-default'}>
              {item}
              <IconClose
                className="pointer"
                onClick={() => {
                  deleteLabel(item);
                }}
              />
            </span>
          );
        })}

        {showInput ? (
          <Input
            size="small"
            ref={inputRef}
            className="custom-label-input"
            placeholder={i18n.t('common:please enter')}
            value={inputVal}
            onChange={(e: any) => setInputVal(e.target.value)}
            onPressEnter={addLabel}
            onBlur={addLabel}
          />
        ) : (
          <Button
            type="primary"
            ghost
            className="custom-label-add"
            onClick={() => {
              toggleShowInput();
            }}
          >
            + {labelName}
          </Button>
        )}
      </div>
    );
  },
);

export const checkCustomLabels = (_rule: any, value: string[], callback: Function) => {
  const valueArr = isEmpty(value) ? [] : value;
  const reg = /^[a-zA-Z0-9-]+$/;

  const notPass = valueArr.length
    ? some(valueArr, (val: string) => {
        return val.trim() ? !reg.test(val.trim()) : true;
      })
    : false;
  return notPass ? callback(i18n.t('dcos:each label can only contain alphanumeric and underline')) : callback();
};

export const checkTagLabels = (_rule: any, value: string[], callback: Function) => {
  const valueArr = isEmpty(value) ? [] : value;
  const reg = /^[A-Za-z]([-A-Za-z0-9_.]*)[A-Za-z]$/;

  const notPass = valueArr.length
    ? some(valueArr, (val: string) => {
        return val.trim() ? !reg.test(val.trim()) : true;
      })
    : false;
  return notPass
    ? callback(
        i18n.t(
          'dcos:each label can only contain alphanumeric underscore underline and point,start and end with alphabet',
        ),
      )
    : callback();
};
