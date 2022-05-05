import {
  UiNode,
  UiNodeAttributes,
  UiNodeInputAttributes,
  UiNodeImageAttributes,
  UiNodeTextAttributes,
  UiNodeScriptAttributes,
  UiNodeAnchorAttributes,
} from '@ory/kratos-client';
import { i18n } from 'src/common';

export function isUiNodeAnchorAttributes(attrs: UiNodeAttributes): attrs is UiNodeAnchorAttributes {
  return attrs.node_type === 'a';
}

export const isUiNodeImageAttributes = (attrs: UiNodeAttributes): attrs is UiNodeImageAttributes => {
  return attrs.node_type === 'img';
};
export const isUiNodeInputAttributes = (attrs: UiNodeAttributes): attrs is UiNodeInputAttributes => {
  return attrs.node_type === 'input';
};
export const isUiNodeTextAttributes = (attrs: UiNodeAttributes): attrs is UiNodeTextAttributes => {
  return attrs.node_type === 'text';
};
export const isUiNodeScriptAttributes = (attrs: UiNodeAttributes): attrs is UiNodeScriptAttributes => {
  return attrs.node_type === 'script';
};

export const getNodeLabel = (node: UiNode) => {
  const attributes = node.attributes;
  if (isUiNodeAnchorAttributes(attributes)) {
    return attributes.title.text;
  }
  if (isUiNodeImageAttributes(attributes)) {
    return node.meta.label?.text || '';
  }
  if (isUiNodeInputAttributes(attributes)) {
    if (attributes.label?.text) {
      return attributes.label.text;
    }
  }
  return node.meta.label?.text || '';
};

export const getNodeId = ({ attributes }: { attributes: UiNodeAttributes }) => {
  if (isUiNodeInputAttributes(attributes)) {
    return attributes.name;
  } else {
    return attributes.id;
  }
};

export const getValuesValid = (values: Obj, nodes: UiNode[], ignorRegKeys: string[] = []) => {
  const unValidTips: Obj<string> = {};
  const validMap: Obj = {
    phone: {
      pattern: /^(1[3|4|5|7|8|9])\d{9}$/,
      message: i18n.t('Please enter the correct {name}', { name: i18n.t('mobile') }),
    },
    email: {
      pattern: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
      message: i18n.t('Please enter the correct {name}', { name: i18n.t('email') }),
    },
    password: {
      pattern: /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){0,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/,
      message: i18n.t('password-tip'),
    },
  };
  nodes.forEach((node) => {
    const { attributes } = node;
    const { name, required } = (attributes || {}) as UiNodeInputAttributes;
    const nameArr = name.split('.');
    const nameKey = nameArr[nameArr.length - 1];
    const curValid = validMap[nameKey];
    if (!ignorRegKeys.includes(nameKey)) {
      if (required && !values[name]) {
        unValidTips[name] = i18n.t('can not be empty');
      } else if (curValid && values[name] && !curValid.pattern.test(values[name])) {
        unValidTips[name] = curValid.message;
      }
    }
  });
  return unValidTips;
};

export const customTypeMap: Obj<string> = {
  avatar: 'image',
};
