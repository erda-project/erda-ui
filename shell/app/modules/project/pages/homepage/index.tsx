import React from 'react';
import i18n from 'core/i18n';
import { map } from 'lodash';
import { Tooltip } from 'antd';
import { ErdaIcon, Ellipsis, FormModal, MarkdownEditor } from 'common';
import remarkGfm from 'remark-gfm';
import routeInfoStore from 'core/stores/route';
import { regRules, goTo } from 'common/utils';
import { useUpdate } from 'common/use-hooks';
import { eventHub } from 'common/utils/event-hub';
import ReactMarkdown from 'react-markdown';
import { ScalableImage } from 'common/components/edit-field';
import './index.scss';

const links = [
  'www.github.com/erda-projec/erda-ui',
  'www.github.com/erda-project/erda-ui-enterprise',
  'www.github.com/erda-project…',
];

const LinkList = (props) => {
  const { item } = props;
  const [isHover, setIsHover] = React.useState(false);
  const onHover = () => setIsHover(true);
  const outHover = () => setIsHover(false);

  return (
    <div
      key={item}
      className={`${isHover ? 'cursor-pointer' : ''} flex items-center`}
      onMouseEnter={onHover}
      onMouseLeave={outHover}
    >
      <ErdaIcon type="lianjie" />
      <div className={`${isHover ? 'cursor-pointer' : ''} ml-2 w-56 px-2 flex justify-between items-center`}>
        <div className="w-52">
          <Ellipsis className="text-purple-deep" title={item} />
        </div>
        <ErdaIcon type="edit" className={`${isHover ? 'inline' : 'hidden'} w-4 ml-2 self-center`} size={16} />
      </div>
    </div>
  );
};

const ReadMeMarkdown = ({ value, onChange, onSave, disabled, originalValue, maxHeight, ...rest }) => {
  const [{ v, expanded, expandBtnVisible, isEditing }, updater, update] = useUpdate({
    v: value,
    expanded: false,
    isEditing: false,
    expandBtnVisible: false,
  });

  const mdContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    updater.v(value);
  }, [updater, value]);

  const operationBtns = !disabled
    ? [

        // height: 28px;
        // width: 52px;
        // background: #302647;
        // border-radius: 2px;
        // background-color: #302647;

        {
          text: i18n.t('commit'),
          type: 'primary' as const,
          className: 'bg-default text-white h-8 flex justify-center items-center relative -top-0.5',
          onClick: (_v: string) => {
            onSave(_v);
            updater.isEditing(false);
          },
        },
        {
          text: i18n.t('cancel'),
          className: 'text-default-8 bg-default-06 h-8 flex justify-center items-center relative -top-0.5',
          onClick: () => {
            update({ v: originalValue, isEditing: false });
          },
        },
      ]
    : [];

  return isEditing ? (
    <MarkdownEditor
      {...rest}
      value={v}
      onChange={onChange}
      onBlur={(_v: string) => onSave(_v, 'markdown')}
      defaultMode="md"
      defaultHeight={maxHeight}
      operationBtns={operationBtns}
    />
  ) : (
    <Tooltip placement="left" title={i18n.t('dop:click to edit')} arrowPointAtCenter>
      <div
        className="relative hover:bg-hover-gray-bg cursor-pointer rounded w-full"
        onClick={() => updater.isEditing(true)}
        style={{ maxHeight: expanded ? '' : maxHeight }}
      >
        <div className="overflow-hidden" style={{ maxHeight: 'inherit' }}>
          <div ref={mdContentRef} className="md-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: ScalableImage }}>
              {value || i18n.t('no description yet')}
            </ReactMarkdown>
            <div
              className={`absolute left-0 bottom-0 w-full h-16 bg-gradient-to-b from-transparent to-white flex justify-center items-center ${
                !expandBtnVisible || expanded ? 'hidden' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </Tooltip>
  );
};
export const ProjectHomepage = () => {
  const hasBrief = false;
  const { projectId } = routeInfoStore.useStore((s) => s.params);

  const [isVisible, setIsVisible] = React.useState(false);

  const handleLink = (id?: string) => {
    setIsVisible(true);
  };
  // const maxMarkdownHeight = (document.documentElement.clientHeight - 86) * 0.7;
  const fieldsList = [
    {
      label: i18n.t('URL'),
      name: 'url',
      itemProps: {
        placeholder: i18n.d('请将地址粘贴至该处'),
      },
      rules: [
        { max: 255, message: i18n.t('dop:Up to 255 characters for directory name') },
        {
          validator: (_, value: string, callback: Function) => {
            return value && !regRules.ip.pattern.test(value) && !regRules.url.pattern.test(value)
              ? callback(i18n.t('please fill in the correct IP address or domain name!'))
              : callback();
          },
        },
      ],
    },
    {
      label: i18n.t('name'),
      required: false,
      name: 'message',
      itemProps: {
        placeholder: i18n.d('请给该地址取一个简单易懂的名称吧'),
        maxLength: 50,
      },
    },
  ];

  return (
    <div className="project-homepage">
      <div className="homepage-header bg-default">
        <div className="project-icon">3</div>
        <div className="project-name">Erda</div>
      </div>
      <div className="homepage-body flex justify-between px-4">
        <div className="homepage-markdown w-full mr-4">
          <ReadMeMarkdown
            value={
              '**\nREADME.md\n**\n\n### 【环境信息】\n\n\n### 【缺陷描述】*\n\n\n### 【重现步骤】\n\n\n### 【实际结果】\n\n\n### 【期望结果】*\n\n\n### 【修复建议】\n\n **\nREADME.md\n**\n\n### 【环境信息】\n\n\n### 【缺陷描述】*\n\n\n### 【重现步骤】\n\n\n### 【实际结果】\n\n\n### 【期望结果】*\n\n\n### \n\n'
            }
            onChange={''}
            onSave={(v, fieldType) => onChangeCb?.({ [name]: v }, fieldType)}
            originalValue={
              '**\nREADME.md\n**\n\n### 【环境信息】\n\n\n### 【缺陷描述】*\n\n\n### 【重现步骤】\n\n\n### 【实际结果】\n\n\n### 【期望结果】*\n\n\n### 【修复建议】\n\n **\nREADME.md\n**\n\n### 【环境信息】\n\n\n### 【缺陷描述】*\n\n\n### 【重现步骤】\n\n\n### 【实际结果】\n\n\n### 【期望结果】*\n\n\n### \n\n'
            }
          />
        </div>
        <div className="homepage-info py-3">
          <div className="info-title">{i18n.d('关于')}</div>
          <div className="info-brief mb-4">
            {hasBrief ? (
              'Enterprise-grade application building deployment monitoring platform (AnPaas)'
            ) : (
              <span>
                用一句话讲述你的项目，让更多的人快速了解你的项目，前往{' '}
                <span
                  onClick={() => goTo(goTo.pages.projectSetting, { projectId })}
                  className="text-purple-deep mx-1 cursor-pointer"
                >
                  项目设置
                </span>{' '}
                进行配置
              </span>
            )}
          </div>
          <div className="info-links">
            {map(links, (item) => (
              <LinkList item={item} />
            ))}
            <div className="flex items-center" onClick={handleLink}>
              <ErdaIcon type="lianjie" />
              <div className={` ml-2 w-56 px-2 flex justify-between items-center`}>{i18n.d('点击添加URL地址')}</div>
            </div>
          </div>
        </div>
      </div>
      <FormModal
        wrapClassName='new-form-modal'
        onOk={() => console.log('ok')}
        onCancel={() => setIsVisible(false)}
        name={i18n.t('URL')}
        visible={isVisible}
        fieldsList={fieldsList}
        formData={{}}
      />
    </div>
  );
};
