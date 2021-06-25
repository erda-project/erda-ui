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

import * as React from 'react';
import ReactDOM from 'react-dom';
import {
  isArray,
  reduce,
  isEmpty,
  find,
  uniq,
  map,
  filter,
  merge,
  groupBy,
  maxBy,
  values,
  compact,
  keys,
  get,
  min,
  minBy,
  difference,
  sortBy,
  cloneDeep,
  set,
} from 'lodash';
// @ts-ignore
import Snap from 'snapsvg-cjs';
import { CHART_CONFIG } from './config';
import { resetChartConfig, getTopologyExternal, setTopologyExternal, externalKey } from './utils';
import { ITopologyNode } from './index';
import './topology-utils.scss';

/**
 *
 * @param originData: 原始数据{name:xx,parents:[]}[]
 * @param snap: snap ref
 * @param g: sanp.group ref
 * @param external: config object(配置项)
 * @return
 *  containerWidth: svg图宽度
 *  containerHeight: svg图高度
 */
const emptyFun = () => {};
export const renderTopology = (originData: ITopologyNode[], snap: any, g: any, external: any = {}) => {
  const chartConfig = resetChartConfig(merge(CHART_CONFIG, external.chartConfig));
  // 获取n个独立的节点组（n个独立的图）
  let containerWidth = 0;
  let containerHeight = 0;
  if (isEmpty(get(originData, 'nodes'))) return { containerWidth, containerHeight };

  const microserviceChart = dataHandler.getMicroserviceChart(get(originData, 'nodes'), chartConfig);
  const { nodeGroup = [], nodeGroupMap } = dataHandler.getGroupChart(get(originData, 'nodes'), chartConfig);
  const marginToTop = get(microserviceChart, 'boxHeight', 0);
  const { direction } = chartConfig;
  const groupDataNodeMap = {};
  let groupChart = {};
  const { startX, startY, boxWidth, boxHeight, children } = nodeGroupMap as any;
  const y = marginToTop + startY;
  containerWidth = boxWidth;
  containerHeight = boxHeight;
  const chart = snap.svg(startX, y, boxWidth, boxHeight, 0, 0, boxWidth, boxHeight);
  g.append(chart);
  groupChart = chart;
  map(children, (subItem) => {
    const { startX: subX, startY: subY, boxWidth: subW, boxHeight: subH, children: subC } = subItem;
    map(subC, (subSubItem) => {
      const { startX: subSubX, startY: subSubY, boxWidth: subSubW, boxHeight: subSubH, children: subSubC } = subItem;
      map(subSubC, (tpItem) => {
        const { startX: tpX, startY: tpY, boxWidth: tpWidth, boxHeight: tpHeight, children: tpC } = tpItem;
        map(tpC, (tp) => {
          const { startX: X, startY: Y, boxWidth: W, boxHeight: H, nodeMap, links } = tp;
          const distance = {
            disX: subX + subSubX + tpX + X,
            disY: subY + subSubY + tpY + Y,
          };
          // renderNodes({ nodeMap }, chart, external, chartConfig, distance);
          // renderLinks({ links, nodeMap }, chart, external, chartConfig, distance);
        });
      });
    });
  });

  // nodeGroup.forEach(({ boxWidth, boxHeight, links, nodeMap, nodeList, linkTopDistance, linkDownDistance, categoryBox }) => {
  //   groupDataNodeMap = nodeMap;
  //   const x = 0;
  //   let y = marginToTop;
  //   const vx = 0;
  //   let vy = 0; // viewBox坐标
  //   if (direction === 'horizontal') {
  //     y = containerHeight + marginToTop;
  //     containerWidth = boxWidth > containerWidth ? boxWidth : containerWidth;
  //     containerHeight += boxHeight + marginToTop;
  //     vy = -linkTopDistance;
  //   } else if (direction === 'vertical') {
  //     // TODO
  //   }
  // 在snap中创建独立的svg，并renderNodes和renderLinks
  // const chart = snap.svg(x, y, boxWidth, boxHeight, vx, vy, boxWidth, boxHeight);
  // g.append(chart);
  // renderCategoryBox({ categoryBox, linkDownDistance, linkTopDistance }, chart, external);
  // renderNodes({ nodeMap }, chart, external, chartConfig);
  // renderLinks({ links, nodeMap }, chart, external, chartConfig);
  // groupChart = chart;
  // });

  if (!isEmpty(microserviceChart)) {
    const {
      boxWidth: mBoxWidth,
      boxHeight: mBoxHeight,
      nodeMap: mNodeMap,
      categoryBox: mCategoryBox,
    } = microserviceChart as any;
    containerWidth = mBoxWidth > containerWidth ? mBoxWidth : containerWidth;
    containerHeight += mBoxHeight;
    const chartX = (containerWidth - mBoxWidth) / 2;
    const mChart = snap.svg(chartX, 0, mBoxWidth, mBoxHeight, 0, 0, mBoxWidth, mBoxHeight);
    g.append(mChart);
    renderCategoryBox(
      {
        categoryBox: mCategoryBox,
        linkDownDistance: -40,
        linkTopDistance: -40,
      },
      mChart,
      external,
    );
    renderNodes({ nodeMap: mNodeMap, groupNodeMap: groupDataNodeMap, groupChart }, mChart, external, chartConfig);
  }
  return { containerWidth, containerHeight };
};

const dataHandler = {
  // 微服务
  getMicroserviceChart: (originData: ITopologyNode[], chartConfig: any) => {
    const groupMap = groupBy(originData, `${externalKey}.group`) || {};
    const { microservice } = groupMap;
    if (isEmpty(microservice)) return {};
    const len = microservice.length;
    const {
      padding,
      NODE: { width, height, margin },
      boxMargin,
    } = chartConfig;
    const nodeMap = {};
    const boxWidth = (width + margin.x) * len - margin.x + padding.x * 2;
    const boxHeight = height + margin.y - margin.y + padding.y * 2;

    const startX = padding.x + width / 2;
    const startY = padding.y + height / 2;
    const groupBox = {};
    const lineBoxMarginX = boxMargin.x;
    const lineBoxMarginY = boxMargin.y;
    map(microservice, (item, idx: number) => {
      const { id, group } = getTopologyExternal(item);
      const x = startX + idx * (margin.x + width);
      const y = startY;
      if (idx === 0 && !groupBox[group]) {
        groupBox[group] = {
          startX: x - lineBoxMarginX - width / 2,
          startY: y - lineBoxMarginY - height / 2,
        };
      }

      if (idx === len - 1) {
        groupBox[group] = {
          ...(groupBox[group] || {}),
          endX: x + lineBoxMarginX + width / 2,
          endY: y + lineBoxMarginY + height / 2,
        };
      }
      nodeMap[id] = setTopologyExternal(item, { deepth: idx + 1, x, y, uniqName: id } as any);
    });
    return { boxWidth, boxHeight, nodeMap, groupBox };
  },
  // 获取n个独立的数据组Map
  getGroupChart: (originData: ITopologyNode[], chartConfig: any) => {
    if (isEmpty(originData)) return {};
    const groupMap = groupBy(originData, `${externalKey}.group`) || {};
    const { microservice, ...rest } = groupMap;
    const allGroupData: any[] = [];
    const allGroupMap = {};
    map(rest, (list, groupKey) => {
      const subGroupMap = groupBy(list, `${externalKey}.subGroup`);
      const allSubGroupData: any[] = [];
      allGroupMap[groupKey] = {
        dataList: list,
        children: {},
      };
      map(subGroupMap, (subList, subGroupKey) => {
        const formatData = dataHandler.getNodesFormat(subList);
        const nodeDeepthList = dataHandler.getGroupNodesDeepth(formatData.data);
        allGroupMap[groupKey].children[subGroupKey] = {
          dataList: subList,
          children: [],
        };
        if (!isEmpty(nodeDeepthList)) {
          nodeDeepthList.forEach((g: any, idx: number) => {
            const { startNodes, nodeList, deepMap } = g || {};
            const curNodeIds = map(nodeList, (item) => item.id);
            let curNodeMap = {};
            map(
              filter(originData, (item) => curNodeIds.includes(item.id)),
              (item, i2) => {
                curNodeMap[item.id] = item;
                // 作为节点的唯一ID
                set(curNodeMap[item.id], `${externalKey}.uniqName`, `node-${item.id}`);
              },
            );
            curNodeMap = merge(curNodeMap, deepMap); // 合并节点层级属性
            const {
              nodeMap,
              boxWidth,
              boxHeight, // categoryBox,
            } = dataHandler.getNodesPosition(curNodeMap, chartConfig); // 节点定位

            const { links, linkTopDistance, linkDownDistance } = dataHandler.getLinks(nodeList, nodeMap, chartConfig); // 获取链接（包含link定位）

            let totalWidth = boxWidth;
            let totalHeight = boxHeight;
            const { direction, padding } = chartConfig;
            const curTopDistance = linkTopDistance > 0 ? linkTopDistance + padding.y / 2 : linkTopDistance;
            const curDownDistance = linkDownDistance > 0 ? linkDownDistance + padding.y / 2 : linkDownDistance;
            if (direction === 'horizontal') {
              totalHeight += curTopDistance + curDownDistance;
            } else if (direction === 'vertical') {
              totalWidth += curTopDistance + curDownDistance;
            }

            const curG = {
              nodeMap, // 节点信息：包含节点层级、节点x/y坐标,
              nodeList,
              boxWidth: totalWidth, // 图宽
              boxHeight: totalHeight, // 图高
              links, // 连接线信息：包含连线坐标
              linkTopDistance: curTopDistance, // 跨层级线高度（上方）
              linkDownDistance: curDownDistance, // 跨层级线高度（下方）
              // categoryBox,
            };
            allGroupMap[groupKey].children[subGroupKey].children.push(curG);
          });
        }
        allSubGroupData.push({
          nodeList: formatData.data,
          nodeDeepthList: dataHandler.getGroupNodesDeepth(formatData.data),
        });
      });
      allGroupData.push(allSubGroupData);
    });

    const nodeGroupMap = dataHandler.getTopologyMap(allGroupMap, chartConfig);
    const nodeGroup: any[] = [];
    allGroupData.forEach((list: any[], i: number) => {
      list.forEach((subList) => {
        const curG = get(subList, 'nodeDeepthList');

        if (!isEmpty(curG)) {
          curG.forEach((g: any) => {
            const { startNodes, nodeList, deepMap } = g || {};
            const curNodeIds = map(nodeList, (item) => item.id);
            let curNodeMap = {};
            map(
              filter(originData, (item) => curNodeIds.includes(item.id)),
              (item, i2) => {
                curNodeMap[item.id] = item;
                // 作为节点的唯一ID
                set(curNodeMap[item.id], `${externalKey}.uniqName`, `node-${item.id}`);
              },
            );
            curNodeMap = merge(curNodeMap, deepMap); // 合并节点层级属性
            const {
              nodeMap,
              boxWidth,
              boxHeight, // categoryBox,
            } = dataHandler.getNodesPosition(curNodeMap, chartConfig); // 节点定位

            const { links, linkTopDistance, linkDownDistance } = dataHandler.getLinks(nodeList, nodeMap, chartConfig); // 获取链接（包含link定位）

            let totalWidth = boxWidth;
            let totalHeight = boxHeight;
            const { direction, padding } = chartConfig;
            const curTopDistance = linkTopDistance > 0 ? linkTopDistance + padding.y / 2 : linkTopDistance;
            const curDownDistance = linkDownDistance > 0 ? linkDownDistance + padding.y / 2 : linkDownDistance;

            if (direction === 'horizontal') {
              totalHeight += curTopDistance + curDownDistance;
            } else if (direction === 'vertical') {
              totalWidth += curTopDistance + curDownDistance;
            }
            nodeGroup.push({
              nodeMap, // 节点信息：包含节点层级、节点x/y坐标,
              nodeList,
              boxWidth: totalWidth, // 图宽
              boxHeight: totalHeight, // 图高
              links, // 连接线信息：包含连线坐标
              linkTopDistance: curTopDistance, // 跨层级线高度（上方）
              linkDownDistance: curDownDistance, // 跨层级线高度（下方）
              // categoryBox,
            });
          });
        }
      });
    });
    return { nodeGroup, nodeGroupMap };
  },
  // 平铺节点: {name:x,parents:[...]} => [{name:x,parent:p1},...]
  getNodesFormat: (dataArr: ITopologyNode[]) => {
    if (!isArray(dataArr)) return { data: [], countMap: {} };
    const data = reduce(
      dataArr,
      (res: any[], item) => {
        const { id, parents, ...rest } = item;
        if (parents && parents.length > 0) {
          let pCount = 0;
          parents.forEach((p: any) => {
            const curParentId = (find(dataArr, { id: p.id }) || {}).id || '';
            // 过滤不存在的节点和自己调自己的节点
            if (curParentId && curParentId !== id) {
              pCount += 1;
              res.push({ parent: curParentId, parents, id, nodeType: 'node', ...rest });
            }
          });
          if (pCount === 0) {
            // 有父但父count为0，则可能父节点不存在或只有自己是自己的父节点
            res.push({ parent: '', id, parents, nodeType: 'node', ...rest });
          }
        } else {
          res.push({ parent: '', id, parents, nodeType: 'node', ...rest });
        }
        return res;
      },
      [],
    );
    return { data };
  },
  // 获取节点组层级
  getGroupNodesDeepth: (nodeList: ITopologyNode[]) => {
    const nodeIds = uniq(map(nodeList, (i) => i.id));
    const getTreeNodeList = (treeNodes: string[]) => {
      return filter(nodeList, (n: ITopologyNode) => treeNodes.includes(n.id));
    };
    let deepMap = {};
    // 找出每个节点开始往下遍历的最长路径，并记录节点deep
    const traversal = (nodeId: string, IdList = [] as string[], deep = 1, pNode = '') => {
      if (nodeId && !IdList.includes(nodeId)) {
        IdList.push(nodeId);
        const outTotal = filter(nodeList, { parent: nodeId }).length;
        const inTotal = filter(nodeList, { id: nodeId }).length;
        deepMap[nodeId] = { [externalKey]: { deepth: deep, outTotal, inTotal, id: nodeId } };
        const children = filter(nodeList, { parent: nodeId }) as ITopologyNode[];
        for (let i = 0; i < children.length; i++) {
          traversal(children[i].id, IdList, deep + 1, nodeId);
        }
      } else if (IdList.includes(nodeId)) {
        // 已经设置过层级的节点
        // 若当前线为环，则deep不变，已经在列，则取大deep
        const prevDeep = deepMap[nodeId][externalKey].deepth;
        const pDeep = deepMap[pNode][externalKey].deepth;
        const isCircle = dataHandler.isCircleData(nodeId, pNode, nodeList);
        /** 层级变动需要顺延的两种情况
         *  1、非循环节点，且已设置深度小于当前深度，取更深后子节点顺延
         *  2、循环节点，且当前深度等于父节点深度，避免在同一层级，顺延
         */
        if ((!isCircle && prevDeep < deep) || (isCircle && prevDeep === pDeep)) {
          deepMap[nodeId][externalKey].deepth = deep;
          // 有层级变动的节点，其下所有节点都需要顺延改变
          const children = filter(nodeList, { parent: nodeId }) as ITopologyNode[];
          for (let i = 0; i < children.length; i++) {
            traversal(children[i].id, IdList, deep + 1, nodeId);
          }
        }
      }
      return IdList;
    };
    let startNodes: string[] = [];
    let sortTree = [];
    const startNodesDataMap = {};
    const traversalMap = {};
    const traversalDeepMap = {};
    for (let i = 0, len = nodeIds.length; i < len; i++) {
      deepMap = {};
      const nameList = traversal(nodeIds[i]);
      traversalDeepMap[nodeIds[i]] = deepMap;
      // 如果第一次的遍历中存在长度是总长的节点，则找到唯一树的开始节点
      if (nameList.length === nodeIds.length) {
        startNodes.push(nodeIds[i]);
        startNodesDataMap[nodeIds[i]] = nodeList;
        sortTree.push(nameList);
        break;
      }
      traversalMap[nodeIds[i]] = nameList;
    }
    // 第一次循环未找出开始节点，则为n个树，需要找出n个开始节点
    if (!startNodes.length) {
      const treeMap = reduce(
        traversalMap,
        (res: any, item: string[], key) => {
          const currentRes = { ...res };
          let isInclude = false;
          map(res, (tree, treeKey) => {
            // 有"全包含"关系的节点，比较找出路径最长的节点
            const uniqLen = uniq([...tree, ...item]).length;
            if (uniqLen === tree.length || uniqLen === item.length) {
              isInclude = true;
              if (item.length > tree.length) {
                // 写入更长的路径
                delete currentRes[treeKey];
                delete startNodesDataMap[treeKey];
                currentRes[key] = item;
                startNodesDataMap[key] = getTreeNodeList(item);
              }
            }
          });
          if (!isInclude) {
            currentRes[key] = item;
            startNodesDataMap[key] = getTreeNodeList(item);
          }
          return currentRes;
        },
        {},
      );
      startNodes = uniq(Object.keys(treeMap));
      sortTree = sortBy(
        map(
          reduce(
            treeMap,
            (res: any, item, key) => {
              const currentRes = { ...res };
              const resList = map(res, (treeList, treeKey) => ({ list: treeList, treeKey }));
              // filter所有map中的相同树，避免交叉树被遗漏，如当前item=[2,3]  res: [1,2] [4,3];
              const sameTree = filter(resList, (resItem: any[]) => {
                const { list } = resItem as any;
                const concatArr = [...list, ...item];
                const uniqLen = uniq([...concatArr]).length;
                return uniqLen !== concatArr.length;
              });
              if (sameTree.length) {
                let sameList: string[] = [];
                sameTree.forEach((sameItem: any) => {
                  const { list, treeKey } = sameItem;
                  delete currentRes[treeKey];
                  sameList = sameList.concat(list);
                });
                currentRes[key] = uniq([...item, ...sameList]);
              } else {
                currentRes[key] = item;
              }
              return currentRes;
            },
            {},
          ),
          (o) => o,
        ),
        (l) => -l.length,
      );
    }
    // 最终得到的startNodes及对应的节点list
    return map(sortTree, (tree: string[]) => {
      const starts: string[] = [];
      const list: ITopologyNode[] = [];
      nodeList.forEach((node) => {
        if (tree.includes(node.id)) {
          list.push(node);
          if (startNodes.includes(node.id)) starts.push(node.id);
        }
      });
      let countDeepMap = dataHandler.getCountDeepMap(nodeList, starts);

      countDeepMap = dataHandler.forwardDeepth(countDeepMap, nodeList);
      countDeepMap = dataHandler.backwardDeepth(countDeepMap);
      countDeepMap = dataHandler.sortDeepthNode(countDeepMap, nodeList);
      return {
        startNodes: starts,
        nodeList: list,
        deepMap: countDeepMap,
      };
    });
  },
  // 节点层级优化1：将跨层的节点往前移动
  forwardDeepth: (deepMap: any, nodeList: ITopologyNode[]) => {
    const deepthGroup = groupBy(deepMap, `${externalKey}.deepth`);
    const reMap = cloneDeep(deepMap);
    map(deepthGroup, (list: any) => {
      map(list, (item: any) => {
        const {
          [externalKey]: { id, deepth },
        } = item;
        const childrenDeep: number[] = [];
        map(nodeList, (dataItem: any) => {
          if (dataItem.parent === id) {
            childrenDeep.push(deepMap[dataItem.id][externalKey].deepth);
          }
        });
        const childMinDeep = min(childrenDeep) || 1; // 找到子的最上层级;
        if (childMinDeep - deepth > 1) {
          // 跨层级，将节点往后移动
          reMap[id][externalKey].deepth = childMinDeep - 1;
        }
      });
    });
    return reMap;
  },
  /**
   * 根据层级数生成最终deepth
   * 原因：
   *  深度遍历，节点的deepth会根据返回数据的顺序不同而变化
   *  有环数据可能会因为高层级节点在后导致层级靠后，则中间可能会有层级缺失。
   * */
  backwardDeepth: (deepMap: any) => {
    const deepthGroup = map(groupBy(deepMap, `${externalKey}.deepth`));
    const reMap = cloneDeep(deepMap);
    map(deepthGroup, (list: any, index) => {
      map(list, (item: any) => {
        const {
          [externalKey]: { id },
        } = item;
        reMap[id][externalKey].deepth = index + 1;
      });
    });
    return reMap;
  },
  // 节点层级优化2：每一层节点打上sort标记
  sortDeepthNode: (deepMap: any, nodeList: ITopologyNode[]) => {
    const deepthGroup = groupBy(deepMap, `${externalKey}.deepth`);
    const reMap = cloneDeep(deepMap);
    map(deepthGroup, (list: any, lev: string) => {
      const len = list.length;
      if (lev === '1') {
        map(sortBy(list, `${externalKey}.outTotal`), ({ [externalKey]: { id, outTotal } }, i) => {
          set(reMap[id], `${externalKey}.levelSort`, outTotal * 100 + i);
        });
      } else {
        map(list, ({ [externalKey]: { id, outTotal } }, idx: number) => {
          const curNode = find(nodeList, { id });
          const { parents = [] } = curNode as ITopologyNode;
          let levelSort = idx;
          parents.forEach((p: any) => {
            const pMap = get(reMap, `[${p.id}].${externalKey}`);
            if (pMap && Number(lev) - Number(pMap.deepth) === 1) {
              // 上层父
              levelSort = pMap.levelSort > levelSort ? levelSort : pMap.levelSort;
            }
          });
          set(reMap[id], `${externalKey}.levelSort`, levelSort);
        });
      }
    });
    return reMap;
  },
  getCountDeepMap: (nodeList: ITopologyNode[], starts: string[]) => {
    const deepMap = {};
    // 找出每个节点开始往下遍历的最长路径，并记录节点deep
    const traversal = (nodeId: string, deep = 1, pNode = '') => {
      if (!deepMap[nodeId]) {
        const outTotal = filter(nodeList, { parent: nodeId }).length;
        const inTotal = filter(nodeList, { id: nodeId }).length;
        deepMap[nodeId] = { [externalKey]: { deepth: deep, outTotal, inTotal, id: nodeId } };
        const children = filter(nodeList, { parent: nodeId }) as ITopologyNode[];
        for (let i = 0; i < children.length; i++) {
          traversal(children[i].id, deep + 1, nodeId);
        }
      } else if (deepMap[nodeId]) {
        // 已经设置过层级的节点
        // 若当前线为环，则deep不变，已经在列，则取大deep
        const prevDeep = deepMap[nodeId][externalKey].deepth;
        const pDeep = deepMap[pNode][externalKey].deepth;
        const isCircle = dataHandler.isCircleData(nodeId, pNode, nodeList);
        /** 层级变动需要顺延的两种情况
         *  1、非循环节点，且已设置深度小于当前深度，取更深后子节点顺延
         *  2、循环节点，且当前深度等于父节点深度，避免在同一层级，顺延
         */

        if ((!isCircle && prevDeep < deep) || (isCircle && prevDeep === pDeep)) {
          deepMap[nodeId][externalKey].deepth = deep;
          // 有层级变动的节点，其下所有节点都需要顺延改变
          const children = filter(nodeList, { parent: nodeId }) as ITopologyNode[];
          for (let i = 0; i < children.length; i++) {
            traversal(children[i].id, deep + 1, nodeId);
          }
        }
      }
    };

    for (let i = 0, len = starts.length; i < len; i++) {
      traversal(starts[i]);
    }
    return deepMap;
  },
  isCircleData: (n1: string, n2: string, nodeList: ITopologyNode[]) => {
    const data1 = find(nodeList, { parent: n1, id: n2 });
    const data2 = find(nodeList, { parent: n2, id: n1 });
    if (data1 && data2) {
      // 直接环
      return true;
    } else {
      const getChildren = (nodeId: string, children: string[] = []) => {
        if (!children.includes(nodeId)) {
          children.push(nodeId);
          const childrenList = filter(nodeList, { parent: nodeId }) as ITopologyNode[];
          for (let i = 0; i < childrenList.length; i++) {
            getChildren(childrenList[i].id, children);
          }
        }
        return children;
      };

      const n1_children = getChildren(n1);
      const n2_children = getChildren(n2);
      if (n1_children.includes(n2) && n2_children.includes(n1)) return true; // 间接环
      return false;
    }
  },
  // 获取节点位置信息
  getNodesPosition: (nodeMap: object, chartConfig: any) => {
    let boxWidth = 0;
    let boxHeight = 0;
    const {
      boxMargin,
      NODE: { width, height, margin },
      direction,
    } = chartConfig;
    const lineBoxMarginX = boxMargin.x;
    const lineBoxMarginY = boxMargin.y;
    const curNodeMap = cloneDeep(nodeMap);
    // const categoryBox = {};
    if (!isEmpty(curNodeMap)) {
      const deepthGroup = groupBy(curNodeMap, `${externalKey}.deepth`);
      const maxColumn = (maxBy(values(deepthGroup)) || []).length;
      const rowNum = keys(deepthGroup).length;
      if (direction === 'horizontal') {
        boxWidth = (width + margin.x) * rowNum - margin.x;
        boxHeight = (height + margin.y) * maxColumn - margin.y;
      } else if (direction === 'vertical') {
        // TODO
      }

      map(deepthGroup, (list: ITopologyNode[], deepth: number) => {
        const len = list.length;
        let startX = 0;
        let startY = 0;
        let startDistance = 0;
        if (direction === 'horizontal') {
          startDistance = height / 2 + (boxHeight - (len * (height + margin.y) - margin.y)) / 2;
          startY += startDistance;
          startX += width / 2;
        } else if (direction === 'vertical') {
          // TODO
        }
        map(sortBy(list, `${externalKey}.levelSort`), (node: ITopologyNode, i: number) => {
          // 每一个层级的最上和最下，在此做标记，用于画跨层级线
          if (direction === 'horizontal') {
            const x = startX + (deepth - 1) * (margin.x + width);
            const y = startY + i * (margin.y + height);
            if (i === 0) {
              curNodeMap[node.id][externalKey].edgeStart = true;
            }

            if (i === len - 1) {
              curNodeMap[node.id][externalKey].edgeEnd = true;
            }
            curNodeMap[node.id][externalKey].x = x;
            curNodeMap[node.id][externalKey].y = y;
          } else if (direction === 'vertical') {
            curNodeMap[node.id][externalKey].x = startX + i * (margin.x + width);
            curNodeMap[node.id][externalKey].y = startY + (deepth - 1) * (margin.y + height);
          }
        });
      });
    }
    return {
      nodeMap: curNodeMap,
      boxWidth: boxWidth < 0 ? 0 : boxWidth,
      boxHeight: boxHeight < 0 ? 0 : boxHeight,
      // categoryBox,
    };
  },
  // 获取图links
  getLinks: (nodeList: ITopologyNode[], nodeMap: object, chartConfig: any) => {
    const links = [] as any;
    nodeList.forEach((node: ITopologyNode) => {
      const { parent, id } = node;
      if (parent) {
        const lk = { source: parent, target: id, nodeType: 'link' } as any;
        if (find(nodeList, { id: parent, parent: id })) {
          // 存在反向线
          lk.hasReverse = true;
        }
        links.push(lk);
      }
    });
    return dataHandler.getLinkPosition({ nodeMap, links }, chartConfig);
  },
  // 获取节点links的位置
  getLinkPosition: ({ nodeMap, links }: any, chartConfig: any) => {
    const {
      NODE: { width, margin, height },
      direction,
      LINK: { linkDis },
    } = chartConfig;

    const halfWidth = width / 2;
    const halfMaginX = margin.x / 2;
    const halfHeight = height / 2;
    const halfMarginY = margin.y / 2;

    const deepthGroup = groupBy(nodeMap, `${externalKey}.deepth`);
    const edgePlusMap = {};
    map(deepthGroup, (gList: any, lev) => {
      // 每个层级上跨层级线的边缘叠加数
      const curStartNode = find(gList, { [externalKey]: { edgeStart: true } }) as any;
      const curEndEdgeNode = find(gList, { [externalKey]: { edgeEnd: true } }) as any;
      edgePlusMap[lev] = {
        startX: curStartNode[externalKey].x - halfWidth,
        originStartX: curStartNode[externalKey].x - halfWidth,
        startY: curStartNode[externalKey].y - halfHeight,
        originStartY: curStartNode[externalKey].y - halfHeight,
        endX: curEndEdgeNode[externalKey].x + halfWidth,
        originEndX: curEndEdgeNode[externalKey].x + halfWidth,
        endY: curEndEdgeNode[externalKey].y + halfHeight,
        originEndY: curEndEdgeNode[externalKey].y + halfHeight,
      };
    });
    const maxColumn: any = maxBy(values(deepthGroup)) || [];
    const edgeStartNode = get(find(maxColumn, { [externalKey]: { edgeStart: true } }), externalKey) as any;
    const edgeEndNode = get(find(maxColumn, { [externalKey]: { edgeEnd: true } }), externalKey) as any;
    const centerY = edgeStartNode.y + (edgeEndNode.y - edgeStartNode.y) / 2;
    // TODO：vertical
    const centerX = edgeStartNode.x + (edgeEndNode.x - edgeStartNode.x) / 2;

    const reLinks = map(links, (link) => {
      const { source, target, hasReverse } = link;
      const sourceNode = nodeMap[source][externalKey];
      const targetNode = nodeMap[target][externalKey];
      let posArr: any[] = [];
      // >0:起点在终点的后面；==0:终点起点同一垂直线；<0:起点在终点前面
      const xPos = sourceNode.x - targetNode.x;
      // >0:起点在终点下方；==0:终点起点同一水平线；<0:起点在终点上方
      const yPos = sourceNode.y - targetNode.y;
      const id = `link__${sourceNode.uniqName}__${targetNode.uniqName}`;
      if (direction === 'horizontal') {
        // 相邻层级节点：在两节点之间水平中心点位置开始折线
        if (Math.abs(sourceNode.deepth - targetNode.deepth) === 1) {
          const [p0_x, p1_x, p2_x] =
            xPos > 0
              ? [sourceNode.x - halfWidth, sourceNode.x - halfMaginX - halfWidth, targetNode.x + halfWidth]
              : [sourceNode.x + halfWidth, sourceNode.x + halfMaginX + halfWidth, targetNode.x - halfWidth];

          const p0_y = sourceNode.y;
          let p1_y = targetNode.y;
          const p2_y = targetNode.y;
          if (hasReverse && sourceNode.y <= centerY && targetNode.y <= centerY) {
            // 有反向线且为直线
            p1_y += xPos > 0 ? 25 : -25;
          }
          posArr = [p0_x, p0_y, p1_x, p1_y, p2_x, p2_y];
        } else if (Math.abs(sourceNode.deepth - targetNode.deepth) > 1) {
          // 跨层级节点：先移动到最上/下方，折线然后平移到目标节点的层级后，再次折线到目标
          const [p0_x, p1_x, p2_x, p3_x] =
            xPos > 0
              ? [
                  sourceNode.x - halfWidth,
                  sourceNode.x - halfMaginX - halfWidth,
                  targetNode.x + halfWidth + halfMaginX,
                  targetNode.x + halfWidth,
                ]
              : [
                  sourceNode.x + halfWidth,
                  sourceNode.x + halfMaginX + halfWidth,
                  targetNode.x - halfWidth - halfMaginX,
                  targetNode.x - halfWidth,
                ];

          const sourceDeepth = nodeMap[source][externalKey].deepth;
          const targetDeepth = nodeMap[target][externalKey].deepth;

          let betweenMaxDeepth = 0;
          let betweenMaxLen = 0;
          // 计算跨层级中间最高的层级，最高层级的数据长度
          map(edgePlusMap, (pos, deepKey) => {
            if (
              (deepKey > sourceDeepth && deepKey < targetDeepth) ||
              (deepKey < sourceDeepth && deepKey > targetDeepth)
            ) {
              if (deepthGroup[deepKey].length > betweenMaxLen) {
                betweenMaxLen = deepthGroup[deepKey].length;
                betweenMaxDeepth = Number(deepKey);
              }
            }
          });
          const sourceLen = deepthGroup[sourceDeepth].length;
          const targetLen = deepthGroup[targetDeepth].length;
          const curMaxDeep: number = get(
            maxBy(
              [
                { deep: sourceDeepth, len: sourceLen },
                { deep: targetDeepth, len: targetLen },
                { deep: betweenMaxDeepth, len: betweenMaxLen },
              ],
              (o) => o.len,
            ),
            'deep',
          );
          const curMaxEdge = edgePlusMap[`${curMaxDeep}`];

          const p0_y = sourceNode.y;
          let p1_y = 0;

          // 上折
          const upBreak = [curMaxEdge.startY - linkDis, curMaxEdge.startY - linkDis];
          // 下折
          const downBreak = [curMaxEdge.endY + linkDis, curMaxEdge.endY + linkDis];

          if (sourceNode.y === centerY && targetNode.y === centerY && hasReverse) {
            xPos > 0
              ? ([p1_y, edgePlusMap[`${curMaxDeep}`].endY] = downBreak)
              : ([p1_y, edgePlusMap[`${curMaxDeep}`].startY] = upBreak);
          } else if (sourceNode.y <= centerY && targetNode.y <= centerY) {
            // 中线上方，上折
            [p1_y, edgePlusMap[`${curMaxDeep}`].startY] = upBreak;
          } else if (sourceNode.y >= centerY && targetNode.y >= centerY) {
            // 中线下方，下折
            [p1_y, edgePlusMap[`${curMaxDeep}`].endY] = downBreak;
          } else {
            // 起点和终点分布在中线两边，则从起点就近折
            yPos > 0
              ? ([p1_y, edgePlusMap[`${curMaxDeep}`].endY] = downBreak)
              : ([p1_y, edgePlusMap[`${curMaxDeep}`].startY] = upBreak);
          }
          const p2_y = p1_y;
          const p3_y = targetNode.y;
          posArr = [p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y];
        }
      } else if (direction === 'vertical') {
        // TODO
      }
      return {
        ...link,
        [externalKey]: {
          posArr,
          id,
          sourceNode: nodeMap[source],
          targetNode: nodeMap[target],
          linkData: {
            ...nodeMap[target],
            parents: find(nodeMap[target].parents, { id: source }),
          },
        },
      };
    });

    const edgePlusList = map(edgePlusMap);
    const topObj: any = minBy(edgePlusList, (t: any) => t.startY);
    const downObj: any = maxBy(edgePlusList, (d: any) => d.endY);
    return {
      links: reLinks,
      linkTopDistance: topObj.originStartY - topObj.startY,
      linkDownDistance: topObj.endY - downObj.originEndY,
    };
  },
  // 根据groupMap计算拓扑
  getTopologyMap: (groupMap: any, chartConfig: any) => {
    const { padding, groupPadding } = chartConfig;
    const newGroupList = sortBy(groupMap, `dataList[0].${externalKey}.groupLevel`);
    const newGroupMap = cloneDeep(groupMap);
    let totalWidth = 0;
    let totalHeight = 0;
    map(newGroupList, (group) => {
      const groupKey = get(group, `dataList[0][${externalKey}].group`);
      const groupChildren = get(group, 'children', {});
      const subStartX = groupPadding.x / 2;
      const subStartY = groupPadding.y / 2;
      let groupWidth = 0;
      let groupHeight = 0;
      map(groupChildren, (subGroup, subGroupKey) => {
        const subKey = `${groupKey}.children.${subGroupKey}`;
        const chartList = get(subGroup, 'children', []);
        const chartStartX = padding.x / 2;
        const chartStartY = padding.y / 2;
        let subGroupWidth = 0;
        let subGroupHeight = 0;
        chartList.forEach((chart: any, idx: number) => {
          const { boxWidth, boxHeight } = chart;
          const chartKey = `${groupKey}.children.${subGroupKey}.children[${idx}]`;
          set(newGroupMap, `${chartKey}.startX`, chartStartX);
          set(newGroupMap, `${chartKey}.startY`, chartStartY + subGroupHeight);
          subGroupWidth = boxWidth > subGroupWidth ? boxWidth : subGroupWidth;
          subGroupHeight = subGroupHeight + boxHeight + padding.y;
        });
        subGroupWidth += padding.x;
        set(newGroupMap, `${subKey}.boxWidth`, subGroupWidth);
        set(newGroupMap, `${subKey}.boxHeight`, subGroupHeight);

        if (groupKey === 'addon') {
          set(newGroupMap, `${subKey}.startX`, subStartX);
          set(newGroupMap, `${subKey}.startY`, subStartY + groupHeight);
          groupWidth = subGroupWidth > groupWidth ? subGroupWidth : groupWidth;
          groupHeight = groupHeight + subGroupHeight + groupPadding.y;
        } else {
          set(newGroupMap, `${subKey}.startX`, subStartX + groupWidth);
          set(newGroupMap, `${subKey}.startY`, subStartY);
          groupHeight = subGroupHeight > groupHeight ? subGroupHeight : groupHeight;
          groupWidth = groupWidth + subGroupWidth + groupPadding.x;
        }
      });
      if (groupKey === 'addon') {
        groupWidth += groupPadding.x;
      } else {
        groupHeight += groupPadding.y;
      }
      set(newGroupMap, `${groupKey}.boxWidth`, groupWidth);
      set(newGroupMap, `${groupKey}.boxHeight`, groupHeight);
      set(newGroupMap, `${groupKey}.startX`, totalWidth);
      set(newGroupMap, `${groupKey}.startY`, totalHeight);
      totalWidth += groupWidth;
      totalHeight += groupHeight;
    });
    return {
      startX: 0,
      startY: 0,
      boxWidth: totalWidth,
      boxHeight: totalHeight,
      children: newGroupMap,
    };
  },
};

const renderCategoryBoxs = (boxMap: any, snap: any, g: any, external: any) => {
  // const list = map(categoryBox);
  // const minStartY = get(minBy(list, 'startY'), 'startY', 0) as number;
  // const maxEndY = get(maxBy(list, 'endY'), 'endY', 0) as number;
  const BoxComp = external.boxEle;
  map(boxMap, (posData: any, key: string) => {
    const { startX, startY, width, height } = posData;
    const chart = snap.svg(startX, startY, width, height, startX, startY, width, height);
    const fobjectSVG = `<foreignObject id="box-${key}" class="node-carrier" x="${startX}" y="${startY}" width="${width}" height="${height}">
    </foreignObject>`;
    const box = Snap.parse(fobjectSVG);
    chart.append(box);
    g.append(chart);
    ReactDOM.render(<BoxComp name={key} pos={posData} />, document.getElementById(`box-${key}`));
  });
};

const renderCategoryBox = (
  { categoryBox, linkDownDistance = 0, linkTopDistance = 0 }: any,
  snap: any,
  external: any,
) => {
  const list = map(categoryBox);
  const minStartY = get(minBy(list, 'startY'), 'startY', 0) as number;
  const maxEndY = get(maxBy(list, 'endY'), 'endY', 0) as number;
  const BoxComp = external.boxEle;
  map(categoryBox, (posData: any, key: string) => {
    const { startX, endX } = posData;
    const pos = { startX, startY: minStartY - linkTopDistance, endX, endY: maxEndY + linkDownDistance };
    const fobjectSVG = `<foreignObject id="${key}" class="node-carrier" x="${pos.startX}" y="${pos.startY}" width="${
      pos.endX - pos.startX
    }" height="${pos.endY - pos.startY}">
    </foreignObject>`;
    const box = Snap.parse(fobjectSVG);
    snap.append(box);

    ReactDOM.render(<BoxComp name={key} pos={pos} />, document.getElementById(`${key}`));
  });
};

interface IRender {
  nodeMap: object;
  groupNodeMap?: any;
  groupChart?: any;
}
export const renderNodes = (
  { nodeMap, groupNodeMap, groupChart }: IRender,
  snap: any,
  external: any,
  chartConfig: any,
  distance = { disX: 0, disY: 0 },
) => {
  const NodeComp = external.nodeEle;
  const { disX, disY } = distance;
  map(nodeMap, (node: ITopologyNode) => {
    const {
      NODE: { width, height },
    } = chartConfig;
    const {
      [externalKey]: { x, y, uniqName },
    } = node as any; // x,y为中心点
    const startX = x - width / 2 + disX;
    const startY = y - height / 2 + disY;
    const nodeId = uniqName;
    const fobjectSVG = `<foreignObject id="${nodeId}" class="node-carrier" x="${startX}" y="${startY}" width="${width}" height="${height}">
    </foreignObject>`;
    // g标签上加id，用于设置opcity属性（兼容safari）
    const g = snap.g().attr({ id: `${nodeId}-g` });
    const f = Snap.parse(fobjectSVG);
    g.append(f);
    // write append node as a React Component
    ReactDOM.render(
      <NodeComp
        {...external}
        nodeStyle={chartConfig.NODE}
        node={node}
        onHover={() => onHover(node)}
        outHover={() => outHover(node)}
        onClick={() => clickNode(node)}
      />,
      document.getElementById(`${nodeId}`),
    );
  });
  // 获取关联节点
  const getRelativeNodes = (_node: ITopologyNode) => {
    const { category, parents: curParents = [] } = _node;
    // 微服务特殊需求
    if (category === 'microservice') {
      const fullParents = map(curParents, 'id');
      const mRelativeNode: string[] = [];
      const mUnRelativeNode: string[] = [];
      map(groupNodeMap, (item) => {
        const {
          parents,
          [externalKey]: { uniqName },
          id,
        } = item;
        const beParentId = map(parents, 'id');
        if (fullParents.includes(id) || beParentId.includes(_node.id)) {
          mRelativeNode.push(uniqName);
        } else {
          mUnRelativeNode.push(uniqName);
        }
      });
      return {
        relativeNode: mRelativeNode,
        unRelativeNode: mUnRelativeNode,
      };
    }

    let relativeNode: string[] = [];
    const unRelativeNode: string[] = [];
    const curNodeName = _node[externalKey].uniqName as string;
    map(nodeMap, (item: ITopologyNode) => {
      const {
        parents = [],
        [externalKey]: { uniqName },
      } = item;
      const parentNames = compact(map(parents, (p: ITopologyNode) => get(nodeMap, `${p.id}.${externalKey}.uniqName`)));
      if (uniqName === curNodeName) {
        relativeNode = relativeNode.concat(parentNames).concat(uniqName);
      } else if (parentNames.includes(curNodeName)) {
        relativeNode.push(uniqName);
      } else {
        unRelativeNode.push(uniqName);
      }
    });
    const allNodeUniqName = map(nodeMap, (item: ITopologyNode) => item[externalKey].uniqName);
    return {
      relativeNode,
      unRelativeNode: difference(allNodeUniqName, relativeNode),
    };
  };
  // 获取关联links
  const getRelativeLinks = (_node: ITopologyNode) => {
    // 微服务特殊需求
    if (_node.category === 'microservice') {
      const allGroupLinks = groupChart.selectAll('.topology-link'); // 选出所有link;
      return {
        relativeLink: [],
        unRelativeLink: map(allGroupLinks),
      };
    }
    const allLinks = snap.selectAll('.topology-link'); // 选出所有link;
    const curNodeName = _node[externalKey].uniqName;
    const relativeLink: any[] = [];
    const unRelativeLink: any[] = [];
    map(allLinks, (link) => {
      const linkId = link.node.id;
      const [_x, source, target] = linkId.split('__');
      if ([source, target].includes(curNodeName)) {
        relativeLink.push(link);
      } else {
        unRelativeLink.push(link);
      }
    });
    return {
      relativeLink,
      unRelativeLink,
    };
  };

  const onHover = (_node: ITopologyNode) => {
    const { relativeLink, unRelativeLink } = getRelativeLinks(_node);
    const { relativeNode, unRelativeNode } = getRelativeNodes(_node);
    // 微服务特殊需求
    hoverAction(
      true,
      {
        relativeNode,
        unRelativeNode,
        relativeLink,
        unRelativeLink,
        hoverNode: _node,
      },
      _node.category === 'microservice' ? groupChart : snap,
      external,
      chartConfig,
    );
  };

  const outHover = (_node: ITopologyNode) => {
    const { relativeLink, unRelativeLink } = getRelativeLinks(_node);
    const { relativeNode, unRelativeNode } = getRelativeNodes(_node);

    // 微服务特殊需求
    hoverAction(
      false,
      {
        relativeNode,
        unRelativeNode,
        relativeLink,
        unRelativeLink,
      },
      _node.category === 'microservice' ? groupChart : snap,
      external,
      chartConfig,
    );
  };
  const clickNode = (_node: ITopologyNode) => {
    external.onClickNode(_node);
  };
};

interface ILinkRender {
  links: ILink[];
  nodeMap: object;
}
interface ILink {
  source: string;
  target: string;
  hasReverse?: boolean;
}

const getLinkTextPos = (pos: number[], chartConfig: any) => {
  const { direction } = chartConfig;
  const len = pos.length;
  let z = 0;
  let [x, y] = [pos[len - 4], pos[len - 3]];
  let textUnderLine = false;
  if (direction === 'horizontal') {
    if (len === 8) {
      // 4点线，2折: __/————\__
      if (pos[1] === pos[3] && pos[3] === pos[5]) {
        const centerDisX = pos[6] - pos[4];
        const centerDisY = pos[7] - pos[5];
        x = pos[centerDisX > 0 ? 6 : 4] - Math.abs(centerDisX / 2);
        y = pos[centerDisY > 0 ? 7 : 5] - Math.abs(centerDisY / 2);
        z = (Math.atan2(pos[5] - pos[7], pos[4] - pos[6]) / Math.PI) * 180 + 180;
      } else {
        const centerDis = pos[4] - pos[2];
        x = pos[centerDis > 0 ? 4 : 2] - Math.abs(centerDis / 2);
        y = pos[3];
        textUnderLine = pos[1] < pos[3];
      }
    } else if (len === 6) {
      // 3点线
      if (pos[5] === pos[1] && pos[1] !== pos[3]) {
        // 1折对称：\/
        y = pos[3];
        textUnderLine = pos[3] > pos[1];
      } else if (pos[5] === pos[1] && pos[1] === pos[5]) {
        // 0折：————
        [x, y] = [pos[2], pos[3]];
      } else if (pos[1] !== pos[3]) {
        // 1折: ——\，文字在折线段中点
        const centerDisX = pos[2] - pos[0];
        const centerDisY = pos[3] - pos[1];
        x = pos[centerDisX > 0 ? 2 : 0] - Math.abs(centerDisX / 2);
        y = pos[centerDisY > 0 ? 3 : 1] - Math.abs(centerDisY / 2);
        z = (Math.atan2(pos[1] - pos[3], pos[0] - pos[2]) / Math.PI) * 180 + 180;
      }
    }
  } // TODO:vertical
  return { x, y, z, textUnderLine };
};

// 渲染link
export const renderLinks = ({ links, nodeMap }: ILinkRender, snap: any, external: any, chartConfig: any) => {
  const { svgAttr } = chartConfig;
  const LinkComp = external.linkTextEle;
  const startMarker = snap.circle(3, 3, 3).attr({ fill: '#333' }).marker(0, 0, 8, 8, 3, 3);
  const endMarker = snap
    .image('/images/zx.svg', 0, 0, 10, 10)
    .attr({ transform: 'roate(-90deg)' })
    .marker(0, 0, 10, 10, 5, 5);

  map(links, (link: any) => {
    const {
      [externalKey]: { id, posArr, linkData, sourceNode, targetNode },
    } = link;
    const [_x, source, target] = id.split('__');
    const textData: any = find(targetNode.parents, { id: sourceNode.id });
    const textId = `text__${source}__${target}`;

    // g标签上加id，用于设置opcity属性（兼容safari）
    const g = snap.g().attr({ id: `${textId}-g` });

    const { x: textX, y: textY, z: textZ, textUnderLine } = getLinkTextPos(posArr, chartConfig);
    let attrObj = {};
    if (textZ !== 0) {
      attrObj = {
        transform: `rotate(${textZ}deg)`,
      };
    }

    const fobjectSVG = `<foreignObject id="${`${textId}`}" class="line-text-carrier" x="${textX - 25}" y="${
      textY - 40
    }" width="${50}" height="${80}"></foreignObject>`;
    const text = Snap.parse(fobjectSVG);
    const in_g = snap.g();
    in_g.append(text).attr({ ...attrObj });
    g.append(in_g);

    const onHover = (_this: any) => {
      const allNodeUniqName = map(nodeMap, (item: ITopologyNode) => item[externalKey].uniqName);
      const unRelativeNode = difference(allNodeUniqName, [source, target]);
      const relativeNode = [source, target];

      const allLinks = snap.selectAll('.topology-link'); // 选出所有link;
      hoverAction(
        true,
        {
          unRelativeNode,
          relativeNode,
          unRelativeLink: difference(allLinks, [_this]),
          relativeLink: [_this],
        },
        snap,
        external,
        chartConfig,
      );
    };
    const outHover = (_this: any) => {
      _this.attr({ ...svgAttr.polyline });
      const allNodeUniqName = map(nodeMap, (item: ITopologyNode) => item[externalKey].uniqName);
      const unRelativeNode = difference(allNodeUniqName, [source, target]);
      const relativeNode = [source, target];
      const allLinks = snap.selectAll('.topology-link'); // 选出所有link;
      hoverAction(
        false,
        {
          unRelativeNode,
          relativeNode,
          unRelativeLink: difference(allLinks, [_this]),
          relativeLink: [_this],
        },
        snap,
        external,
        chartConfig,
      );
    };

    const l = snap
      .polyline(...posArr)
      .attr({
        id,
        ...svgAttr.polyline,
        markerEnd: endMarker,
        markerStart: startMarker,
      })
      .hover(
        function () {
          onHover(this);
        },
        function () {
          outHover(this);
        },
      );

    l[externalKey] = { linkData, posArr, sourceNode, targetNode };
    g.append(l);
    // 渲染线上文字，并添加hover事件
    ReactDOM.render(
      <LinkComp
        id={`${textId}__text`}
        data={textData}
        textUnderLine={textUnderLine}
        onHover={() => onHover(l)}
        outHover={() => outHover(l)}
      />,
      document.getElementById(`${textId}`),
    );
  });
};

// hover高亮效果
const hoverAction = (isHover: boolean, params: any, snap: any, external: any, chartConfig: any) => {
  const { relativeLink = [], relativeNode = [], unRelativeLink = [], unRelativeNode = [], hoverNode } = params;

  const { linkTextHoverAction = emptyFun, nodeHoverAction = emptyFun } = external;
  const { svgAttr } = chartConfig;
  if (isHover) {
    map(unRelativeNode, (name) => {
      snap.select(`#${name}-g`).node.classList.add('topology-node-fade');
      nodeHoverAction(isHover, snap.select(`#${name}-g`).node, {
        ...external,
        hoverNode,
        isRelative: false,
      });
    });
    map(relativeNode, (name) => {
      snap.select(`#${name}-g`).node.classList.add('topology-node-focus');
      nodeHoverAction(isHover, snap.select(`#${name}-g`).node, {
        ...external,
        hoverNode,
        isRelative: true,
      });
    });
    map(relativeLink, (link: any) => {
      const { [externalKey]: linkExternal } = link;
      const { sourceNode, targetNode } = linkExternal;
      // 线上text
      const textId = `text__${sourceNode[externalKey].uniqName}__${targetNode[externalKey].uniqName}`;

      const curText = snap.select(`#${textId}-g`);
      if (curText) {
        if (hoverNode) {
          curText.node.classList.add('topology-link-text-focus');
          linkTextHoverAction(isHover, document.getElementById(`${textId}__text`), {
            ...external,
            isRelative: true,
            hoverNode,
            targetNode,
            sourceNode,
            hoverNodeExternal: get(hoverNode, externalKey),
          });
        }
      }
      // link.attr({ ...svgAttr.polylineFoc });
    });
    map(unRelativeLink, (link: any) => {
      const { [externalKey]: linkExternal } = link;
      const { sourceNode, targetNode } = linkExternal;
      const textId = `text__${sourceNode[externalKey].uniqName}__${targetNode[externalKey].uniqName}`;
      const curText = snap.select(`#${textId}-g`);
      if (curText) {
        curText.node.classList.add('topology-link-text-fade');
        linkTextHoverAction(isHover, document.getElementById(`${textId}__text`), {
          ...external,
          isRelative: false,
          hoverNode,
          targetNode,
          sourceNode,
          hoverNodeExternal: get(hoverNode, externalKey),
        });
      }
      link.attr({ ...svgAttr.polylineFade });
    });
  } else {
    map(unRelativeNode, (name) => {
      snap.select(`#${name}-g`).node.classList.remove('topology-node-fade');
      nodeHoverAction &&
        nodeHoverAction(isHover, snap.select(`#${name}-g`).node, {
          ...external,
          hoverNode,
          isRelative: false,
        });
    });
    map(relativeNode, (name) => {
      snap.select(`#${name}-g`).node.classList.remove('topology-node-focus');
      nodeHoverAction &&
        nodeHoverAction(isHover, snap.select(`#${name}-g`).node, {
          ...external,
          hoverNode,
          isRelative: true,
        });
    });
    map(relativeLink, (link: any) => {
      const { [externalKey]: linkExternal } = link;
      const { sourceNode, targetNode } = linkExternal;
      // 线上text
      const textId = `text__${sourceNode[externalKey].uniqName}__${targetNode[externalKey].uniqName}`;
      const curText = snap.select(`#${textId}-g`);
      if (curText) {
        curText.node.classList.remove('topology-link-text-focus');
        linkTextHoverAction(isHover, document.getElementById(`${textId}__text`), {
          ...external,
          isRelative: false,
          hoverNode,
          targetNode,
          sourceNode,
          hoverNodeExternal: get(hoverNode, externalKey),
        });
      }
      link.attr({ ...svgAttr.polyline });
    });
    map(unRelativeLink, (link: any) => {
      const { [externalKey]: linkExternal } = link;
      const { sourceNode, targetNode } = linkExternal;
      const textId = `text__${sourceNode[externalKey].uniqName}__${targetNode[externalKey].uniqName}`;
      const curText = snap.select(`#${textId}-g`);
      if (curText) {
        curText.node.classList.remove('topology-link-text-fade');
        linkTextHoverAction(isHover, document.getElementById(`${textId}__text`), {
          ...external,
          isRelative: false,
          hoverNode,
          targetNode,
          sourceNode,
          hoverNodeExternal: get(hoverNode, externalKey),
        });
      }
      link.attr({ ...svgAttr.polyline });
    });
  }
};
