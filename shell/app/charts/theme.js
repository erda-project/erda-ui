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
import { LinearGradient } from 'echarts/lib/util/graphic';
import { colorToRgb } from 'common/utils';

export const areaColors = [
  'rgba(3, 91, 227, 0.2)',
  'rgba(45, 192, 131, 0.2)',
  'rgba(91, 69, 194, 0.2)',
  'rgba(254, 171, 0, 0.2)',
  'rgba(216, 66, 218, 0.2)',
  'rgba(80, 163, 227, 0.2)',
  'rgba(223, 52, 9, 0.2)',
  'rgba(246, 213, 26, 0.2)',
  'rgba(16, 41, 151, 0.2)',
  'rgba(46, 139, 54, 0.2)',
  'rgba(162, 56, 183, 0.2)',
  'rgba(156, 195, 255, 0.2)',
];

export const colorMap = {
  blue: '#4169E1',
  green: '#6CB38B',
  purple: '#6a549e',
  orange: '#F7A76B',
  darkcyan: '#498E9E',
  steelblue: '#4E6097',
  red: '#DE5757',
  yellow: '#F7C36B',
  lightgreen: '#8DB36C',
  maroon: '#BF0000',
  darkgoldenrod: '#B8860B',
  teal: '#008080',
  brown: '#A98C72',
  darksalmon: '#DE6F57',
  darkslategray: '#2F4F4F',
  darkseagreen: '#8FBC8F',
  darkslateblue: '#483D8B',
  gray: '#666666',
  lightgray: '#00000099',
};

export const bgColor = 'rgba(0,0,0,0.1)';
export const newColorMap = {
  primary8: '#1E2059', // darkest blue
  primary7: '#2D3280',
  primary6: '#424CA6',
  primary5: '#5C6BCC',
  primary4: '#798CF1',
  primary3: '#A8BAFF',
  primary2: '#D1DCFF',
  primary1: '#F0F4FF',
  warning8: '#400C1C', // darkest red
  warning7: '#66142C',
  warning6: '#8C233D',
  warning5: '#B33651',
  warning4: '#D84B65',
  warning3: '#F2A2AC',
  warning2: '#FFD4D7',
  warning1: '#FFF0F0',
};

export const genLinearGradient = (color) => {
  return new LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: colorToRgb(color, 0.2) },
    { offset: 1, color: colorToRgb(color, 0.01) },
  ]);
};

export const theme = {
  color: [
    colorMap.blue,
    colorMap.green,
    colorMap.purple,
    colorMap.orange,
    colorMap.darkcyan,
    colorMap.steelblue,
    colorMap.red,
    colorMap.yellow,
    colorMap.lightgreen,
    colorMap.maroon,
    colorMap.darkgoldenrod,
    colorMap.teal,
    colorMap.brown,
    colorMap.darksalmon,
    colorMap.darkslategray,
    colorMap.darkseagreen,
    colorMap.darkslateblue,
  ],
  backgroundColor: '#ffffff',
  textStyle: {},
  title: {
    textStyle: {
      color: '#7c7c9e',
    },
    subtextStyle: {
      color: '#7c7c9e',
    },
  },
  line: {
    itemStyle: {
      normal: {
        borderWidth: '2',
      },
    },
    lineStyle: {
      normal: {
        width: '2',
      },
    },
    symbolSize: 1,
    symbol: 'emptyCircle',
    smooth: true,
  },
  radar: {
    itemStyle: {
      normal: {
        borderWidth: '2',
      },
    },
    lineStyle: {
      normal: {
        width: '2',
      },
    },
    symbolSize: 1,
    symbol: 'emptyCircle',
    smooth: true,
  },
  bar: {
    itemStyle: {
      normal: {
        barBorderWidth: '0',
        barBorderColor: '#cccccc',
      },
      emphasis: {
        barBorderWidth: '0',
        barBorderColor: '#cccccc',
      },
    },
  },
  pie: {
    itemStyle: {
      normal: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
      emphasis: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
    },
  },
  scatter: {
    itemStyle: {
      normal: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
      emphasis: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
    },
  },
  boxplot: {
    itemStyle: {
      normal: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
      emphasis: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
    },
  },
  parallel: {
    itemStyle: {
      normal: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
      emphasis: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
    },
  },
  sankey: {
    itemStyle: {
      normal: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
      emphasis: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
    },
  },
  funnel: {
    itemStyle: {
      normal: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
      emphasis: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
    },
  },
  gauge: {
    itemStyle: {
      normal: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
      emphasis: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
    },
  },
  candlestick: {
    itemStyle: {
      normal: {
        color: colorMap.orange,
        color0: 'transparent',
        borderColor: colorMap.red,
        borderColor0: colorMap.green,
        borderWidth: '2',
      },
    },
  },
  graph: {
    itemStyle: {
      normal: {
        borderWidth: '0',
        borderColor: '#cccccc',
      },
    },
    lineStyle: {
      normal: {
        width: 1,
        color: '#aaa',
      },
    },
    symbolSize: 1,
    symbol: 'emptyCircle',
    smooth: true,
    color: [
      colorMap.blue,
      colorMap.green,
      colorMap.purple,
      colorMap.orange,
      colorMap.darkcyan,
      colorMap.steelblue,
      colorMap.red,
      colorMap.yellow,
      colorMap.lightgreen,
      colorMap.maroon,
      colorMap.darkgoldenrod,
      colorMap.teal,
      colorMap.brown,
      colorMap.darksalmon,
      colorMap.darkslategray,
      colorMap.darkseagreen,
      colorMap.darkslateblue,
    ],
    label: {
      normal: {
        textStyle: {
          color: '#ffffff',
        },
      },
    },
  },
  map: {
    itemStyle: {
      normal: {
        areaColor: '#f3f3f3',
        borderColor: '#999999',
        borderWidth: 0.5,
      },
      emphasis: {
        areaColor: 'rgba(255,178,72,1)',
        borderColor: '#eb8146',
        borderWidth: 1,
      },
    },
    label: {
      normal: {
        textStyle: {
          color: '#893448',
        },
      },
      emphasis: {
        textStyle: {
          color: 'rgb(137,52,72)',
        },
      },
    },
  },
  geo: {
    itemStyle: {
      normal: {
        areaColor: '#f3f3f3',
        borderColor: '#999999',
        borderWidth: 0.5,
      },
      emphasis: {
        areaColor: 'rgba(255,178,72,1)',
        borderColor: '#eb8146',
        borderWidth: 1,
      },
    },
    label: {
      normal: {
        textStyle: {
          color: '#893448',
        },
      },
      emphasis: {
        textStyle: {
          color: 'rgb(137,52,72)',
        },
      },
    },
  },
  categoryAxis: {
    axisLine: {
      show: false,
      lineStyle: {
        color: '#aaaaaa',
      },
    },
    axisTick: {
      show: false,
      lineStyle: {
        color: '#333',
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: '#343659',
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#f1f1f1'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)'],
      },
    },
  },
  valueAxis: {
    axisLine: {
      show: false,
      lineStyle: {
        color: '#aaaaaa',
      },
    },
    axisTick: {
      show: false,
      lineStyle: {
        color: '#333',
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: '#343659',
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#f1f1f1'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)'],
      },
    },
  },
  logAxis: {
    axisLine: {
      show: false,
      lineStyle: {
        color: '#aaaaaa',
      },
    },
    axisTick: {
      show: false,
      lineStyle: {
        color: '#333',
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: '#343659',
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#f1f1f1'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)'],
      },
    },
  },
  timeAxis: {
    axisLine: {
      show: false,
      lineStyle: {
        color: '#aaaaaa',
      },
    },
    axisTick: {
      show: false,
      lineStyle: {
        color: '#333',
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: '#343659',
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#f1f1f1'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)'],
      },
    },
  },
  toolbox: {
    iconStyle: {
      normal: {
        borderColor: '#999999',
      },
      emphasis: {
        borderColor: '#666666',
      },
    },
  },
  legend: {
    textStyle: {
      color: '#343659',
    },
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(48,38,71,0.96)',
    borderWidth: 0,
    padding: [8, 16],
    textStyle: {
      color: '#fff',
    },
    axisPointer: {
      type: 'line',
      label: {
        show: false,
      },
      lineStyle: {
        type: 'dashed',
        color: 'rgba(48,38,71,0.40)',
      },
    },
    borderColor: 'rgba(0, 0, 0, .1)',
  },
  timeline: {
    lineStyle: {
      color: '#893448',
      width: 1,
    },
    itemStyle: {
      normal: {
        color: '#893448',
        borderWidth: 1,
      },
      emphasis: {
        color: '#ffb248',
      },
    },
    controlStyle: {
      normal: {
        color: '#893448',
        borderColor: '#893448',
        borderWidth: 0.5,
      },
      emphasis: {
        color: '#893448',
        borderColor: '#893448',
        borderWidth: 0.5,
      },
    },
    checkpointStyle: {
      color: '#eb8146',
      borderColor: 'rgba(255,178,72,0.41)',
    },
    label: {
      normal: {
        textStyle: {
          color: '#893448',
        },
      },
      emphasis: {
        textStyle: {
          color: '#893448',
        },
      },
    },
  },
  visualMap: {
    color: ['#893448', '#d95850', '#eb8146', '#ffb248', '#f2d643', 'rgb(247,238,173)'],
  },
  dataZoom: {
    height: 24,
    // dataBackgroundColor: 'rgba(255,178,72,0.5)',
    backgroundColor: 'rgba(45,50,128,0.06)', // primary7
    fillerColor: 'rgba(45,50,128,0.3)',
    borderColor: 'transparent',
    handleColor: 'white',
    handleIcon:
      'image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjAgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+5ruR5Yqo5p2hPC90aXRsZT4KICAgIDxkZWZzPgogICAgICAgIDxyZWN0IGlkPSJwYXRoLTEiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxNiIgcng9IjEiPjwvcmVjdD4KICAgICAgICA8ZmlsdGVyIHg9Ii01NC4yJSIgeT0iLTM0LjQlIiB3aWR0aD0iMjA4LjMlIiBoZWlnaHQ9IjE4MS4yJSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiBpZD0iZmlsdGVyLTIiPgogICAgICAgICAgICA8ZmVPZmZzZXQgZHg9IjAiIGR5PSIxIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIj48L2ZlT2Zmc2V0PgogICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyIiBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd0JsdXJPdXRlcjEiPjwvZmVHYXVzc2lhbkJsdXI+CiAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMCAwIDAgMCAwLjE4ODIzNTI5NCAgIDAgMCAwIDAgMC4xNDkwMTk2MDggICAwIDAgMCAwIDAuMjc4NDMxMzczICAwIDAgMCAwLjE2IDAiIHR5cGU9Im1hdHJpeCIgaW49InNoYWRvd0JsdXJPdXRlcjEiPjwvZmVDb2xvck1hdHJpeD4KICAgICAgICA8L2ZpbHRlcj4KICAgIDwvZGVmcz4KICAgIDxnIGlkPSLmu5HliqjmnaEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwb2x5Z29uIGlkPSLnn6nlvaIiIGZpbGwtb3BhY2l0eT0iMC40IiBmaWxsPSIjMzAyNjQ3IiBwb2ludHM9IjkuNSAwIDEwIDAgMTAuNSAwIDEwLjUgMjQgOS41IDI0Ij48L3BvbHlnb24+CiAgICAgICAgPGcgaWQ9Iue8lue7hC0zMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNC4wMDAwMDAsIDQuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSLnn6nlvaIiPgogICAgICAgICAgICAgICAgPHVzZSBmaWxsPSJibGFjayIgZmlsbC1vcGFjaXR5PSIxIiBmaWx0ZXI9InVybCgjZmlsdGVyLTIpIiB4bGluazpocmVmPSIjcGF0aC0xIj48L3VzZT4KICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiB4bGluazpocmVmPSIjcGF0aC0xIj48L3VzZT4KICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8cmVjdCBpZD0i55+p5b2iIiBmaWxsLW9wYWNpdHk9IjAuNCIgZmlsbD0iIzMwMjY0NyIgeD0iMyIgeT0iNCIgd2lkdGg9IjIiIGhlaWdodD0iOCIgcng9IjEiPjwvcmVjdD4KICAgICAgICAgICAgPHJlY3QgaWQ9IuefqeW9ouWkh+S7vSIgZmlsbC1vcGFjaXR5PSIwLjQiIGZpbGw9IiMzMDI2NDciIHg9IjciIHk9IjQiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIHJ4PSIxIj48L3JlY3Q+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=',
    handleStyle: {
      shadowColor: 'rgba(23,24,26,0.20)',
      shadowBlur: '3',
      shadowOffsetY: '2',
    },
    textStyle: {
      color: '#333333',
    },
  },
  markPoint: {
    label: {
      normal: {
        textStyle: {
          color: '#ffffff',
        },
      },
      emphasis: {
        textStyle: {
          color: '#ffffff',
        },
      },
    },
  },
};
