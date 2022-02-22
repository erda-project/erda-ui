import * as React from 'react';
import { IssueRelation } from '../issue-relation';
import { ErdaIcon } from 'common';
import { Button } from 'antd';
import i18n from 'i18n';

interface IProps {
  issueDetail: ISSUE.IssueType;
  iterationID: number;
  setHasEdited: (b: boolean) => void;
}

const Module = (props: IProps) => {
  const { issueDetail, iterationID, setHasEdited } = props;
  return (
    <div className="">
      <div className="flex-h-center text-default-6 mb-2">
        <ErdaIcon className="mr-1" type="baohan" />
        <span>{i18n.t('dop:included tasks')}</span>
        <span className="w-[1px] h-[12px] bg-default-1 mx-4" />
        <Button size="small" className="flex-h-center mr-2 font-medium">
          <ErdaIcon type={'plus'} className="mr-1" />
          <span>{i18n.t('create')}</span>
        </Button>
        <Button size="small" className="flex-h-center  font-medium">
          <ErdaIcon type={'xuanze-43le7k0l'} className="mr-1" />
          <span>{i18n.t('common:select')}</span>
        </Button>
      </div>
      <IssueRelation
        type="inclusion"
        issueDetail={issueDetail}
        iterationID={iterationID}
        onRelationChange={() => {
          setHasEdited(true);
        }}
      />
    </div>
  );
};

export default Module;
