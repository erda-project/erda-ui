// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailsPanel from '..';

describe('DetailsPanel', () => {
  const baseInfoConf = {
    title: 'erda info',
    panelProps: {
      fields: [
        {
          label: 'domain',
          value: 'https://www.erda.cloud',
        },
        {
          label: 'name',
          value: 'erda',
        },
      ],
    },
  };

  const props = {
    baseInfoConf,
    linkList: [
      {
        key: 'API',
        showTitle: true,
        linkProps: {
          title: 'API',
          icon: <div className="api-icon" />,
        },
        panelProps: {
          fields: [],
        },
      },
      {
        key: 'TEST',
        showTitle: false,
        linkProps: {
          title: 'TEST',
          icon: <div className="test-icon" />,
        },
        getComp: () => <div className="custom-components">Custom Components</div>,
      },
    ],
  };

  it('should work well', () => {
    const result = render(<DetailsPanel {...props} />);
    expect(result.container).isExit('.anchor-link-title-icon', props.linkList.length);
    expect(result.container).isExit('.api-icon', 1);
    expect(result.container).isExit('.custom-components', 1);
    expect(result.getByText(baseInfoConf.title)).toBeTruthy();
  });
});
