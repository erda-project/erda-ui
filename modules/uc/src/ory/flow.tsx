import React from 'react';
import {
  SelfServiceLoginFlow,
  SelfServiceRecoveryFlow,
  SelfServiceRegistrationFlow,
  SelfServiceSettingsFlow,
  SelfServiceVerificationFlow,
  SubmitSelfServiceLoginFlowBody,
  SubmitSelfServiceRecoveryFlowBody,
  SubmitSelfServiceRegistrationFlowBody,
  SubmitSelfServiceSettingsFlowBody,
  SubmitSelfServiceVerificationFlowBody,
  UiNode,
} from '@ory/kratos-client';
import { useMount, useUpdateEffect } from 'react-use';
import { isUiNodeInputAttributes, getNodeId, getValuesValid, customTypeMap } from './utils';
import { Node, Alert } from './node';

export type Values = Partial<
  | SubmitSelfServiceLoginFlowBody
  | SubmitSelfServiceRegistrationFlowBody
  | SubmitSelfServiceRecoveryFlowBody
  | SubmitSelfServiceSettingsFlowBody
  | SubmitSelfServiceVerificationFlowBody
>;

export type Methods = 'oidc' | 'password' | 'profile' | 'totp' | 'webauthn' | 'link' | 'lookup_secret';

interface Props<T> {
  ignorRegKeys?: string[];
  flow?:
    | SelfServiceLoginFlow
    | SelfServiceRegistrationFlow
    | SelfServiceSettingsFlow
    | SelfServiceVerificationFlow
    | SelfServiceRecoveryFlow;
  only?: Methods;
  onSubmit: (values: T) => Promise<void>;
  hideGlobalMessages?: boolean;
}

interface State<T> {
  values: T;
  isLoading: boolean;
}

const Flow = <T extends Values>(props: Props<T>) => {
  const { flow, only, onSubmit, hideGlobalMessages, ignorRegKeys } = props;
  const [state, setState] = React.useState<State<T>>({
    values: {} as T,
    isLoading: false,
  });
  const [validTips, setValidTips] = React.useState<Obj<string>>({});

  const { values, isLoading } = state;

  useMount(() => {
    initializeValues(filterNodes());
  });

  useUpdateEffect(() => {
    initializeValues(filterNodes());
  }, [flow]);

  const filterNodes = (): Array<UiNode> => {
    if (!flow) {
      return [];
    }
    return flow.ui.nodes.filter(({ group }) => {
      if (!only) {
        return true;
      }
      return group === 'default' || group === only;
    });
  };

  const initializeValues = (nodes: Array<UiNode> = []) => {
    const values = {} as T;
    nodes.forEach((node) => {
      // This only makes sense for text nodes
      if (isUiNodeInputAttributes(node.attributes)) {
        if (node.attributes.type === 'button' || node.attributes.type === 'submit') {
          // In order to mimic real HTML forms, we need to skip setting the value
          // for buttons as the button value will (in normal HTML forms) only trigger
          // if the user clicks it.
          return;
        }
        values[node.attributes.name as keyof Values] = node.attributes.value;
      }
    });
    setState((prev) => ({ ...prev, values }));
  };

  const handleSubmit = (e: MouseEvent | React.FormEvent, _values: object = {}) => {
    // Prevent all native handlers
    e.stopPropagation();
    e.preventDefault();
    const newValues = { ...values, ..._values };

    const curValidTips = getValuesValid(newValues, flow?.ui.nodes || [], ignorRegKeys);
    const isValid = Object.values(curValidTips).filter((item) => item).length === 0;
    setValidTips(curValidTips);
    if (!isValid) {
      return;
    }

    // Prevent double submission!
    setState((prev) => ({
      ...prev,
      ...newValues,
      isLoading: true,
    }));

    return onSubmit?.(newValues).finally(() => {
      // We wait for reconciliation and update the state after 50ms
      // Done submitting - update loading status
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    });
  };

  const nodes = filterNodes();

  console.log('------', nodes);

  return flow ? (
    <form action={flow.ui.action} method={flow.ui.method} onSubmit={handleSubmit}>
      {!hideGlobalMessages ? <Alert messages={flow.ui.messages} /> : null}
      {nodes.map((node, k) => {
        const curKey = getNodeId(node) as keyof Values;
        const nameArr = curKey.split('.');
        const nameKey = nameArr[nameArr.length - 1];
        return (
          <Node
            key={`${curKey}-${k}`}
            disabled={isLoading}
            node={node}
            customType={customTypeMap[nameKey]}
            errorTip={validTips[curKey]}
            value={values[curKey]}
            dispatchSubmit={handleSubmit}
            setValue={(value) => {
              setState((prev) => {
                const newValues = { ...prev.values, [curKey]: value };
                setValidTips(getValuesValid(newValues, nodes, ignorRegKeys));
                return {
                  ...prev,
                  values: newValues,
                };
              });
            }}
          />
        );
      })}
    </form>
  ) : null;
};

export default Flow;
