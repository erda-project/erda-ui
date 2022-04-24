import { useContext } from 'react';
import { ConfigProvider } from 'antd';
import { Context as EcContext } from '../context-provider';

export const usePrefixCls = (
  tag?: string,
  props?: {
    prefixCls?: string;
  },
) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { clsPrefix } = useContext(EcContext);

  return [`${clsPrefix}-${tag}`, getPrefixCls(tag, props?.prefixCls)];
};
