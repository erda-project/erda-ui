import React from 'react';
import {
  isUiNodeImageAttributes,
  isUiNodeScriptAttributes,
  isUiNodeTextAttributes,
  isUiNodeAnchorAttributes,
  isUiNodeInputAttributes,
  getNodeLabel,
  getNodeId,
} from './utils';
import { uploadImg } from 'src/services/uc';
import {
  UiNode,
  UiText,
  UiNodeScriptAttributes,
  UiNodeInputAttributes,
  UiNodeAnchorAttributes,
} from '@ory/kratos-client';
import { FormInput } from 'src/common';

interface Props {
  node: UiNode;
  disabled: boolean;
  value: any;
  errorTip?: string;
  setValue: ValueSetter;
  customType?: string;
  dispatchSubmit: FormDispatcher;
}

export const Node = ({ node, value, setValue, customType, disabled, dispatchSubmit, errorTip }: Props) => {
  if (customType === 'image') {
    return (
      <NodeImage
        dispatchSubmit={dispatchSubmit}
        value={value}
        setValue={setValue}
        node={node}
        disabled={disabled}
        attributes={node.attributes as any}
        errorTip={errorTip}
      />
    );
  }

  if (isUiNodeImageAttributes(node.attributes)) {
    return null;
    // return <NodeImage node={node} attributes={node.attributes} />;
  }
  if (isUiNodeScriptAttributes(node.attributes)) {
    return null;
    // return <NodeScript node={node} attributes={node.attributes} />;
  }

  if (isUiNodeTextAttributes(node.attributes)) {
    return null;
    // return <NodeText node={node} attributes={node.attributes} />;
  }

  if (isUiNodeAnchorAttributes(node.attributes)) {
    return null;
    // return <NodeAnchor node={node} attributes={node.attributes} />;
  }

  if (isUiNodeInputAttributes(node.attributes)) {
    return (
      <NodeInput
        dispatchSubmit={dispatchSubmit}
        value={value}
        setValue={setValue}
        node={node}
        disabled={disabled}
        attributes={node.attributes}
        errorTip={errorTip}
      />
    );
  }

  return null;
};

export const NodeAnchor = ({ attributes }: { attributes: UiNodeAnchorAttributes }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        window.location.href = attributes.href;
      }}
    >
      {attributes.title.text}
    </button>
  );
};

export const NodeScript = ({ attributes }: { attributes: UiNodeScriptAttributes }) => {
  React.useEffect(() => {
    const script = document.createElement('script');

    script.async = true;
    script.src = attributes.src;
    script.async = attributes.async;
    script.crossOrigin = attributes.crossorigin;
    script.integrity = attributes.integrity;
    script.referrerPolicy = attributes.referrerpolicy as React.HTMLAttributeReferrerPolicy;
    script.type = attributes.type;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [attributes]);

  return null;
};

export type ValueSetter = (value: string | number | boolean | undefined) => Promise<void> | void;
export type FormDispatcher = (e: MouseEvent | React.FormEvent, values: object) => Promise<void> | void;

interface NodeInputProps {
  node: UiNode;
  placeholder?: string;
  errorTip?: string;
  attributes: UiNodeInputAttributes;
  value: any;
  disabled: boolean;
  dispatchSubmit: FormDispatcher;
  setValue: ValueSetter;
}
export const NodeInput = (props: NodeInputProps) => {
  const { attributes, disabled, node, dispatchSubmit } = props;
  switch (attributes.type) {
    case 'hidden':
      // Render a hidden input field
      return <input type={attributes.type} name={attributes.name} value={attributes.value || 'true'} />;
    case 'button':
      return null;
    case 'submit':
      // Render a button
      return (
        <div>
          <button
            className="mt-10 bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600 shadow-lg"
            name={attributes.name}
            onClick={(e) => dispatchSubmit(e, { [getNodeId(node)]: attributes.value })}
            value={attributes.value || ''}
            disabled={attributes.disabled || disabled}
          >
            {getNodeLabel(node)}
          </button>
        </div>
      );
  }

  // Render a generic text input field.

  const inputProps = propsConvert(props);

  return <FormInput {...inputProps} />;
};

const NodeImage = (props: NodeInputProps) => {
  const { node, setValue, value } = props;

  const label = node.meta.label?.text;
  // const name = attributes.name;
  const onChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      var fd = new FormData();
      fd.append('file', file, file.name);

      uploadImg(fd)
        .then((res) => {
          const src = res?.[file.name];
          if (src) {
            setValue(src);
          }
        })
        .finally(() => {});
    }
  };

  return (
    <div className="mt-8 relative">
      <div className="text-sm font-bold text-gray-700 tracking-wide flex justify-between items-center relative">
        {label}
      </div>
      {value ? <img src={value} className="w-10 h-10" alt="avatar" /> : null}
      <input id="choosenImg" className="cursor-pointer" type="file" accept="image/*" onChange={onChange} />
    </div>
  );
};

const propsConvert = (props: NodeInputProps) => {
  const { node, attributes, value, setValue, disabled, placeholder = '', errorTip } = props;

  return {
    value,
    type: attributes.type,
    required: attributes.required,
    disabled: attributes.disabled || disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    placeholder,
    errorTip,
    label: node.meta.label?.text,
    name: attributes.name,
    // labelExtra?: null
  };
};

export const Alert = ({ messages }: { messages?: UiText[] }) => {
  if (!messages) return null;
  return (
    <div className="left-0 text-sm -bottom-6 mb-8 mt-12 p-3 rounded bg-gray-100">
      {messages.map((message, idx) => (
        <div
          key={message.id}
          className={`${message.type === 'error' ? 'text-red-500' : ''} ${idx === messages.length - 1 ? '' : 'mb-2'}`}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
};
