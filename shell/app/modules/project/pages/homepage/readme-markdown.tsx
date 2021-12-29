import React from 'react';
import i18n from 'core/i18n';
import { Tooltip } from 'antd';
import { MarkdownEditor } from 'common';
import remarkGfm from 'remark-gfm';
import { useUpdate } from 'common/use-hooks';
import ReactMarkdown from 'react-markdown';
import { ScalableImage } from 'common/components/edit-field';
import './index.scss';

export const ReadMeMarkdown = ({ value, onChange, onSave, disabled, originalValue, maxHeight, ...rest }) => {
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
      onBlur={(_v: string) => {
        console.log({_v}, 999)
        onSave(_v)
      }}
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
