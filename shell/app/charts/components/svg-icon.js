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


const color = {
  black: '#2f4554',
  gray: '#6e7074',
  blue: '#2AB6F6',
  purple: '#4D66FD',
  red: '#E8366C',
  orange: '#FFBC07',
  green: '#84BE44',
  green_blue: '#61a0a8',
  coffee: '#bda29a',
  deep_green: '#749f83',
  deep_orange: '#ca8622',
  light_green: '#91c7ae',
  light_blue: '#1296db',
};

const defaultSize = [0.6, 0.6];

const SVGICONS = {
  my: {
    img: 'image:///images/resources/mysql.png',
    color: color.blue,
    size: [1, 0.9],
  },
  mysql: {
    img: 'image:///images/resources/mysql.png',
    color: color.blue,
    size: defaultSize,
  },
  nodejs: {
    img: 'image:///images/resources/nodejs.png',
    color: color.green,
    size: [1, 0.9],
  },
  redis: {
    img: 'image:///images/resources/redis.png',
    color: color.purple,
    size: defaultSize,
  },
  memcached: {
    img: 'image:///images/resources/memcached.png',
    color: color.red,
    size: defaultSize,
  },
  mongodb: {
    img: 'image:///images/resources/mongodb.png',
    color: color.orange,
    size: defaultSize,
  },
  zookeeper: {
    img: 'image:///images/resources/zookeeper.png',
    color: color.deep_orange,
    size: defaultSize,
  },
  elasticsearch: {
    img: 'image:///images/resources/elasticsearch.png',
    color: color.green_blue,
    size: [1, 1],
  },
  custom: {
    img: 'image:///images/resources/custom.png',
    color: color.coffee,
    size: defaultSize,
  },
  h2: {
    img: 'image:///images/resources/h2.png',
    color: color.deep_green,
    size: [1, 7 / 8],
  },
  database: {
    img: 'image:///images/resources/database.png',
    color: color.green,
    size: defaultSize,
  },
  spring: {
    img: 'image:///images/resources/spring.png',
    color: color.green,
    size: defaultSize,
  },
  postgresql: {
    img: 'image:///images/resources/postgresql.png',
    color: color.black,
    size: defaultSize,
  },
  dubbo: {
    img: 'image:///images/resources/dubbo.png',
    color: color.light_blue,
    size: defaultSize,
  },
  'end-user': {
    img: 'image:///images/resources/end-user.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  'external-service': {
    img: 'image:///images/resources/external-service.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  addon: {
    img: 'image:///images/resources/addon.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  sidecar: {
    img: 'image:///images/resources/sidecar.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  registercenter: {
    img: 'image:///images/resources/registercenter.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  noticecenter: {
    img: 'image:///images/resources/noticecenter.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  configcenter: {
    img: 'image:///images/resources/services.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  service: {
    img: 'image:///images/resources/app.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  app: {
    img: 'image:///images/resources/app.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  instance: {
    img: 'image:///images/resources/instance.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  canal: {
    img: 'image:///images/resources/canal.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  kafka: {
    img: 'image:///images/resources/kafka.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  minio: {
    img: 'image:///images/resources/minio.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  ons: {
    img: 'image:///images/resources/ons.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  rabbitmq: {
    img: 'image:///images/resources/rabbitmq.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  rds: {
    img: 'image:///images/resources/rds.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  rocketmq: {
    img: 'image:///images/resources/rocketmq.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  // noticecenter: {
  //   img: 'image:///images/resources/notice.png',
  //   color: color.light_blue,
  //   size: [0.6, 0.6],
  // },
  gateway: {
    img: 'image:///images/resources/gateway.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
  apigateway: {
    img: 'image:///images/resources/gateway.png',
    color: color.light_blue,
    size: [0.6, 0.6],
  },
};

export { SVGICONS };
