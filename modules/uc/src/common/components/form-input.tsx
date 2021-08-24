import * as React from 'react';

interface IProps {
  value?: string;
  type?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  label: string;
  errorTip?: string;
  labelExtra?: React.ReactNode;
}

const FormInput = (props: IProps) => {
  const { value, onChange, label, errorTip, labelExtra = null, ...rest } = props;

  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="mt-8 relative">
      <div className="text-sm font-bold text-gray-700 tracking-wide flex justify-between items-center">
        {label}
        {labelExtra}
      </div>
      <input
        value={value}
        onChange={_onChange}
        className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
        {...rest}
      />
      {errorTip ? <span className="text-red-500 -bottom-6 left-0 text-sm">{errorTip}</span> : null}
    </div>
  );
};

export default FormInput;
