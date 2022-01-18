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

export const initModuleFederationModule = async (scope: string, module: string) => {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  // @ts-ignore webpack built in function
  await __webpack_init_sharing__('default');
  // @ts-ignore dynamic scope
  const container = window[scope]; // or get the container somewhere else
  // Initialize the container, it may provide shared modules
  // @ts-ignore webpack built in scope
  await container.init(__webpack_share_scopes__.default);
  // @ts-ignore dynamic scope
  const factory = await window[scope].get(module);
  const Module = factory();
  return Module;
};

export const useDynamicScript = (args: { url?: string }) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!args.url) {
      return;
    }

    const element = document.createElement('script');

    element.src = args.url;
    element.type = 'text/javascript';
    element.async = true;

    setReady(false);
    setFailed(false);

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${args.url}`);
      setReady(true);
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${args.url}`);
      setReady(false);
      setFailed(true);
    };

    document.head.appendChild(element);

    return () => {
      console.log(`Dynamic Script Removed: ${args.url}`);
      document.head.removeChild(element);
    };
  }, [args.url]);

  return {
    ready,
    failed,
  };
};
