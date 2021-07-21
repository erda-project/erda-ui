import * as React from 'react';
import ReactDOM from 'react-dom';
import successSvg from '~/images/s_success.svg';
import warningSvg from '~/images/s_warning.svg';
import infoSvg from '~/images/s_info.svg';
import errorSvg from '~/images/s_error.svg';

interface IProps {
  type: IType;
  content: string | IContentObj;
}
interface IContentObj {
  content: string;
  className?: string;
  timer?: number;
}
type IType = 'default' | 'success' | 'error' | 'warning';

const message = {
  default: (content: string | IContentObj) => createMessage(content, 'default'),
  warning: (content: string | IContentObj) => createMessage(content, 'warning'),
  error: (content: string | IContentObj) => createMessage(content, 'error'),
  success: (content: string | IContentObj) => createMessage(content, 'success'),
};

let wrap: HTMLElement;
const defaultTimer = 3000;
const createMessage = (content: string | IContentObj, type: IType) => {
  if (!wrap) {
    wrap = document.createElement('div');
    document.body.appendChild(wrap);
  }

  const timer = typeof content === 'string' ? defaultTimer : content?.timer || defaultTimer;
  const curDiv = document.createElement('div');
  wrap.appendChild(curDiv);
  ReactDOM.render(<Message type={type} content={content} />, curDiv);
  setTimeout(() => {
    wrap.removeChild(curDiv);
  }, timer);
};

const Message = (props: IProps) => {
  const { type, content } = props;

  const [_content, _className] = typeof content === 'string' ? [content, ''] : [content.content, content.className];

  const iconMap = {
    success: successSvg,
    error: errorSvg,
    warning: warningSvg,
    default: infoSvg,
  };

  return (
    <div className={'fixed top-10 z-50 flex w-screen justify-center'}>
      <div
        className={`flex bg-white shadow-xl border-solid border-gray-200 rounded-lg p-2	border relative ${_className}`}
      >
        <img src={iconMap[type]} className="w-5 mr-2" alt="status-icon" />
        <span>{_content}</span>
      </div>
    </div>
  );
};

export default message;
