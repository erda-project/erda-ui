import React from 'react';
import { ErdaIcon as CustomIcon } from 'common';

const GPTItem = ({ message }: { message: React.ReactNode }) => {
  return (
    <div className="py-6 px-4 border-bottom bg-grey">
      <div className="max-w-3xl m-auto flex justify-between">
        <div className="flex-none w-[40px] h-[40px] text-2xl bg-green text-white rounded-sm p-1">
          <CustomIcon type="android" />
        </div>
        <div className="flex-none w-[calc(100%-60px)] text-black text-left">{message}</div>
      </div>
    </div>
  );
};

export default GPTItem;
