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

import defaultProjectIcon from 'app/images/default-project-icon.png';
import defaultOrgIcon from 'app/images/default-org-icon.svg';
import defaultErdaIcon from 'app/static/favicon.ico';
import defaultOrgImg from 'app/images/resources/org.png';
import defaultAppIcon from 'app/images/default-app-icon.png';
import defaultTestCase from 'app/images/default-test-case.svg';
import emptyProjectImg from 'app/images/empty-project.png';
import defaultK8sNodeIcon from 'app/images/default-k8s-node.svg';

const ImgMap = {
  frontImg_default_project_icon: defaultProjectIcon,
  frontImg_default_org_icon: defaultOrgIcon,
  frontImg_erda_favicon: defaultErdaIcon,
  frontImg_default_org_img: defaultOrgImg,
  frontImg_default_app_icon: defaultAppIcon,
  frontImg_empty_project: emptyProjectImg,
  default_test_case: defaultTestCase,
  default_k8s_node: defaultK8sNodeIcon,
};

export default ImgMap;

export const getImg = (imgKey: string) => {
  if (imgKey && ImgMap[imgKey]) {
    return ImgMap[imgKey];
  }
  return imgKey;
};
