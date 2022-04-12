import * as React from 'react';
import i18n from 'i18n';
import { FormModal } from 'app/configForm/nusi-form/form-modal';
import { useUpdate } from 'common/use-hooks';
import { isEmpty, map } from 'lodash';
import { notify } from 'common/utils';
import { getPipelineDetail } from 'application/services/build';
import { parsePipelineYmlStructure } from 'application/services/repo';
import { ymlDataToFormData } from 'app/yml-chart/common/in-params-drawer';

interface IProps {
  onExecute: (v?: { runParams: Obj }) => void;
  beforeExecute?: () => void;
  afterExecute?: () => void;
}

interface InParams {
  name?: string;
  value?: string | number;
  component?: string;
  getComp?: () => React.ReactNode;
}

let inParamsKey = 1;

const InParamsForm = React.forwardRef(
  (
    props: IProps,
    ref: React.Ref<{
      execute: (ymlStr: string, extra: { pipelineID?: string; pipelineDetail?: BUILD.IPipelineDetail }) => void;
    }>,
  ) => {
    const { onExecute: propsOnExecute, beforeExecute, afterExecute } = props;
    const [{ formVis, fields, inParamsForm, executing }, updater, update] = useUpdate({
      formVis: false,
      fields: [] as InParams[],
      inParamsForm: [] as InParams[],
      executing: false,
      needModal: true,
      clusterList: [],
    });

    const onExecute = (v?: { runParams: Obj }) => {
      propsOnExecute?.(v);
      updater.executing(false);
    };

    React.useEffect(() => {
      updater.fields([
        {
          component: 'custom',
          getComp: () => {
            return <div className="font-medium border-bottom">{i18n.t('dop:Inputs')}</div>;
          },
        },
        ...inParamsForm,
      ]);
    }, [inParamsForm, updater]);

    const inFormProps = React.useMemo(() => {
      inParamsKey += 1;
      return { fieldList: fields, key: inParamsKey };
    }, [fields]);

    React.useImperativeHandle(ref, () => ({
      execute: (ymlStr, extra) => {
        const { pipelineID, pipelineDetail } = extra || {};
        updater.executing(true);
        if (executing) return;
        if (ymlStr) {
          beforeExecute?.();
          parsePipelineYmlStructure({ pipelineYmlContent: ymlStr })
            .then(async (res) => {
              const updateObj: Obj = {};
              if (res.data?.stages?.length) {
                updateObj.canDoTest = false;
                updateObj.formVis = true;
              } else {
                notify('warning', i18n.t('dop:please add valid tasks to the pipeline below before operating'));
              }
              let prevParams: Obj<string | number> = {};
              if (pipelineDetail) {
                prevParams = getLastRunParams(pipelineDetail);
              } else if (pipelineID) {
                const curPipelineDetail = await getPipelineDetail({ pipelineID: +pipelineID });
                prevParams = getLastRunParams(curPipelineDetail.data);
              }

              const inP = ymlDataToFormData(res.data?.params || [], prevParams);
              if (!inP.length) {
                // no inparams，no need form;
                updateObj.formVis = false;
              } else {
                updateObj.inParamsForm = inP;
              }
              update(updateObj);
              if (updateObj.formVis === false) onExecute();
            })
            .catch(() => {
              updater.executing(false);
              notify('warning', i18n.t('dop:please add valid tasks to the pipeline below before operating'));
            });
        }
      },
    }));

    const getLastRunParams = (pDetail: BUILD.IPipelineDetail) => {
      const runParams = pDetail?.runParams || [];
      const val: Obj = {};
      runParams.forEach((item) => {
        val[item.name] = item.value;
      });
      return val;
    };

    return (
      <FormModal
        title={i18n.t('Execute')}
        onCancel={() => {
          afterExecute?.();
          update({ formVis: false, executing: false });
        }}
        onOk={(val: Obj) => {
          const runParams = isEmpty(val) ? [] : map(val, (v, k) => ({ name: k, value: v }));
          onExecute({
            runParams,
          });
        }}
        visible={formVis}
        {...inFormProps}
      />
    );
  },
);

export default InParamsForm;
