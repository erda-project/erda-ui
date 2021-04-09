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

import i18n from 'i18n';

const chartLegendText = {
  '75-percentile': `75%${i18n.t('charts:request response time')}`,
  '95-percentile': `95%${i18n.t('charts:request response time')}`,
  tcp: i18n.t('charts:request waiting'),
  srt: i18n.t('charts:server respond time'),
  plt: i18n.t('charts:page load time'),
  rlt: i18n.t('charts:resource load time'),
  request_wating: i18n.t('charts:request waiting'),
  request_net_time: i18n.t('charts:net'),
  request_download: i18n.t('charts:resource load time'),
  page_loading: i18n.t('charts:page load'),
  apdex: i18n.t('charts:Apdex'),
  pv: 'PV',
  rt: i18n.t('charts:response time'),
  satisfied: i18n.t('charts:satisfied'),
  tolerated: i18n.t('charts:tolerated'),
  frustrated: i18n.t('charts:frustrated'),
  'gc.PS-MarkSweep.count.delta': `Full ${i18n.t('charts:GC count')}`,
  'gc.PS-MarkSweep.time.delta': `Full ${i18n.t('charts:GC time')}`,

  'gc.PS-Scavenge.count.delta': i18n.t('charts:increment GC count'),
  'gc.PS-Scavenge.time.delta': i18n.t('charts:increment GC time'),

  'mem.pools.PS-Eden-Space.committed': 'committed',
  'mem.pools.PS-Eden-Space.max': 'max',
  'mem.pools.PS-Eden-Space.usage': 'usage',
  'mem.pools.PS-Eden-Space.used': 'used',

  'mem.pools.PS-Old-Gen.committed': 'committed',
  'mem.pools.PS-Old-Gen.max': 'max',
  'mem.pools.PS-Old-Gen.usage': 'usage',
  'mem.pools.PS-Old-Gen.used': 'used',

  'mem.pools.PS-Survivor-Space.commited': 'committed',
  'mem.pools.PS-Survivor-Space.max': 'max',
  'mem.pools.PS-Survivor-Space.usage': 'usage',
  'mem.pools.PS-Survivor-Space.used': 'used',

  /* -- docker container--*/
  docker_container_mem_usage: i18n.t('charts:memory usage'),
  docker_container_mem_usage_percent: i18n.t('charts:memory usage percent'),
  docker_container_cpu: i18n.t('charts:CPU usage'),
  io_read: i18n.t('charts:io read'),
  io_write: i18n.t('charts:io write'),
  net_read: i18n.t('charts:io read'),
  net_write: i18n.t('charts:io write'),

  usage: i18n.t('charts:usage'),
  usage_percent: i18n.t('charts:usage percent'),
  rx_bytes: i18n.t('charts:received'),
  tx_bytes: i18n.t('charts:send'),
};

export { chartLegendText };
