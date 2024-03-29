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

import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/graph';
import 'echarts/lib/chart/gauge';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/visualMap';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/markLine';
import 'echarts/lib/component/legendScroll';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/scatter';
import 'echarts/lib/chart/map';
import React from 'react';
import ResizeObserver from 'rc-resize-observer';
import themeColor from 'app/theme-color.mjs';
import { theme } from '../theme';
import i18n from 'i18n';

import './echarts.scss';

echarts.registerTheme('erda', theme);

class Echarts extends React.Component {
  // first add
  componentDidMount() {
    const echartObj = this.renderEchartDom();
    const onEvents = this.props.onEvents || {};
    if (this.props.groupId) {
      echartObj.group = this.props.groupId;
      echarts.connect(this.props.groupId);
    }
    Object.keys(onEvents).forEach((eventName) => {
      // ignore the event config which not satisfy
      if (typeof eventName === 'string' && typeof onEvents[eventName] === 'function') {
        // binding event
        echartObj.on(eventName, (param) => {
          onEvents[eventName](param, echartObj);
        });
      }
    });
    // on chart ready
    if (typeof this.props.onChartReady === 'function') this.props.onChartReady(echartObj);
  }

  // update
  componentDidUpdate() {
    this.renderEchartDom();
  }

  // remove
  componentWillUnmount() {
    echarts.dispose(this.echartsDom);
  }

  getEchartsInstance() {
    // return the echart object
    const { mapData } = this.props;
    if (mapData) {
      echarts.registerMap('china', mapData);
      return echarts.init(this.echartsDom, this.props.theme || 'erda');
    }
    return echarts.getInstanceByDom(this.echartsDom) || echarts.init(this.echartsDom, this.props.theme || 'erda');
  }

  // render the dom
  renderEchartDom() {
    const { onClick, onSelect } = this.props;
    // init the echart object
    const echartObj = this.getEchartsInstance();
    // set loading mask
    if (this.props.showLoading) {
      echartObj.showLoading('default', {
        text: `${i18n.t('charts:loading')}...`,
        color: themeColor.primary,
        textColor: '#000',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        zlevel: 0,
      });
    } else echartObj.hideLoading();
    const option = this.props.option;
    if (option.legend && (option.series || []).some((t) => t.type === 'line')) {
      option.legend = {
        ...option.legend,
        icon: 'reat',
        itemWidth: 12,
        itemHeight: 3,
        type: 'scroll',
      };
    }
    if (option.dataZoom) {
      option.dataZoom = option.dataZoom.map((zoomItem) => {
        if (zoomItem.type === 'slider') {
          return {
            ...zoomItem,
            ...(zoomItem.orient === 'horizontal' ? { height: 24 } : { width: 16 }),
          };
        }
        return zoomItem;
      });
    }

    if (onSelect && typeof onSelect === 'function') {
      option.brush = { toolbox: { show: false, brushType: 'lineX' } };
    }

    // set the echart option
    echartObj.setOption(option, this.props.notMerge || false, this.props.lazyUpdate || false);

    if (onClick && typeof onClick === 'function') {
      // echart click function
      echartObj.off('click');
      echartObj.on('click', function (params) {
        const { dataIndex, data } = params;
        let op = echartObj.getOption();
        var name = op.xAxis?.[0].data[dataIndex] || data;
        onClick?.(name);
      });
    }

    if (onSelect && typeof onSelect === 'function') {
      echartObj.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'brush',
        brushOption: {
          brushType: 'lineX', // 指定选框类型
        },
      });
      // echart select function
      echartObj.off('brushEnd');
      echartObj.on('brushEnd', function (params) {
        const { areas = [] } = params;
        const { range = [] } = areas[0] || {};
        const [start, end] = range;
        let op = echartObj.getOption();

        const startIndex = echartObj.convertFromPixel({ seriesIndex: 0 }, [start, 50])[0];
        const endIndex = echartObj.convertFromPixel({ seriesIndex: 0 }, [end, 50])[0];
        onSelect?.([op.xAxis[0].data[startIndex], op.xAxis[0].data[endIndex]]);
      });
    }

    return echartObj;
  }

  render() {
    return (
      <ResizeObserver onResize={() => this.getEchartsInstance().resize()}>
        <div
          ref={(ref) => {
            this.echartsDom = ref;
          }}
          className={`chart-dom ${this.props.className || ''}`}
          style={this.props.style}
        />
      </ResizeObserver>
    );
  }
}

export default Echarts;
