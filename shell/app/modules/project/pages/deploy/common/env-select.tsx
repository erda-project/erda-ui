import * as React from 'react';
import { ENV_MAP } from 'project/common/config';
import { map } from 'lodash';
import { DropdownSelectNew } from 'common';
import i18n from 'i18n';

interface IProps {
  value?: string;
  onChange?: (v: string) => void;
  onClickItem?: (v: string) => void;
  children?: React.ReactElement;
  placement?: string;
  required?: boolean;
  disabled?: boolean;
}

export const envMap = { DEFAULT: i18n.t('global'), ...ENV_MAP };

const EnvSelector = (props: IProps) => {
  const { children, ...rest } = props;
  return (
    <DropdownSelectNew
      {...rest}
      options={map(envMap, (v, k) => ({ key: k, label: v }))}
      optionSize={'small'}
      mode="simple"
      width={160}
    >
      {children}
    </DropdownSelectNew>
  );
};

export default EnvSelector;
