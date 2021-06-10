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

const mock = {
  openapi: '3.0.1',
  info: {
    title: '示例 API 概况',
    description: 'vzxz都是',
    version: '1.0',
  },
  servers: [
    {
      url: 'ddddd',
      variables: {
        newBaseUriParameters: {
          default: '',
        },
        newBaseUriParameter: {
          default: '',
        },
      },
      'x-amf-parameters': {
        newBaseUriParameters: {
          description: 'gvgh',
          example: '07:08:03',
          type: 'time-only',
        },
        newBaseUriParameter: {
          example: 'Example',
          type: 'string',
        },
      },
    },
  ],
  externalDocs: {
    description: 'newItem',
    'x-amf-title': 'newItem',
  },
  'x-amf-userDocumentation': [
    {
      content: 'newItem',
      title: 'newItem',
    },
  ],
  paths: {
    '/test124': {
      get: {
        operationId: 'test1',
        description: '描述',
        parameters: [
          {
            name: 'newQueryParameter',
            required: true,
            in: 'query',
            schema: {
              example: 'Example',
              type: 'string',
            },
          },
          {
            name: 'newHeader',
            required: true,
            in: 'header',
            schema: {
              example: 'Example',
              type: 'string',
            },
          },
          {
            name: 'newHeader1',
            required: true,
            in: 'header',
            schema: {
              example: 'Example',
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'get-response-desc',
                  required: ['str'],
                  properties: {
                    str: {
                      type: 'string',
                      description: 'description of myString',
                      example: 'stringExample',
                      default: 'defaultString',
                      maxLength: 15,
                      minLength: 8,
                    },
                    some_tablegPro: {
                      type: 'object',
                      'x-dice-merge': [
                        {
                          $ref: '#/components/schemas/some_tableg',
                        },
                      ],
                      example: {
                        id: 1.0,
                        name: 'Example',
                        age: 1.0,
                      },
                    },
                  },
                  example: {
                    str: 'stringExample',
                    'some_tablegPro?': {
                      id: 1.0,
                      name: 'Example',
                      age: 1.0,
                    },
                  },
                },
              },
            },
          },
        },
        tags: ['pet'],
      },
      put: {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
              },
            },
            'application/xml': {
              schema: {
                type: 'object',
              },
            },
          },
        },
        responses: {
          200: {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    putProperty: {
                      type: 'object',
                      'x-dice-merge': [
                        {
                          $ref: '#/components/schemas/some_tableg',
                        },
                      ],
                      properties: {
                        newPro: {
                          type: 'object',
                          'x-dice-merge': [
                            {
                              $ref: '#/components/schemas/some_tableg',
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
              'application/xml': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
        tags: ['pet'],
      },
      post: {
        operationId: 'BaseResponse',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'post desc',
              },
            },
          },
        },
        responses: {
          200: {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
    },
    '/new-resource': {
      get: {
        operationId: '展示名',
        parameters: [
          {
            name: 'newQueryParameter',
            required: true,
            in: 'query',
            schema: {
              example: 'Example',
              type: 'string',
            },
          },
        ],
        responses: {},
      },
      post: {
        operationId: '阿达',
        description: '总产值',
        parameters: [
          {
            name: 'id',
            required: true,
            in: 'query',
            schema: {
              example: 1,
              type: 'integer',
              format: 'int',
            },
          },
        ],
        requestBody: {
          content: {
            'as/type': {
              schema: {
                example: 'Example',
                type: 'string',
              },
            },
            'sadad/type': {
              schema: {
                example: 'Example',
                type: 'string',
              },
            },
            'application/json': {
              schema: {
                type: 'object',
              },
            },
            'application/xml': {
              schema: {
                type: 'object',
              },
            },
          },
        },
        responses: {
          200: {
            description: '',
            content: {
              'number/type': {
                schema: {
                  example: 1,
                  type: 'integer',
                  format: 'int',
                },
              },
              'name/type': {
                schema: {
                  description: 'sadada',
                  default: 'ssdasda',
                  example: 'Example',
                  type: 'string',
                  minLength: 1,
                  maxLength: 12,
                },
              },
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
    },
    // '/api/api-docs/{apiDocID}': {
    //   parameters: [
    //     {
    //       name: 'apiDocID',
    //       required: true,
    //       in: 'path',
    //       schema: {
    //         type: 'string',
    //       },
    //     },
    //   ],
    //   get: {
    //     operationId: '获取 API 文档',
    //     parameters: [
    //       {
    //         name: 'key1',
    //         description: 'dsf',
    //         in: 'query',
    //         schema: {
    //           default: 'ddd',
    //           example: 'Example',
    //           type: 'string',
    //           pattern: 'll',
    //         },
    //       },
    //       {
    //         name: 'key2',
    //         required: true,
    //         in: 'query',
    //         schema: {
    //           example: 1.0,
    //           type: 'number',
    //           format: 'int',
    //         },
    //       },
    //       {
    //         name: 'sessionID',
    //         required: true,
    //         in: 'header',
    //         schema: {
    //           example: 'Example',
    //           type: 'string',
    //         },
    //       },
    //     ],
    //     'x-amf-queryParameters': {
    //       newQueryParameter: {
    //         type: 'object',
    //       },
    //     },
    //     responses: {
    //       200: {
    //         description: 'sdfsdsf',
    //         content: {
    //           'application/json': {
    //             schema: {
    //               type: 'object',
    //               required: [
    //                 'newProperty',
    //                 'newProperty1',
    //               ],
    //               properties: {
    //                 newProperty: {
    //                   example: true,
    //                   type: 'boolean',
    //                 },
    //                 newProperty1: {
    //                   type: 'object',
    //                   required: [
    //                     'newPropertyyyyyyyyy',
    //                     'newProperty44444',
    //                   ],
    //                   properties: {
    //                     newPropertyyyyyyyyy: {
    //                       description: 'd',
    //                       type: 'array',
    //                       items: {
    //                         example: 'ttttt',
    //                         type: 'string',
    //                         pattern: '^vv$',
    //                         minLength: 3,
    //                       },
    //                     },
    //                     newProperty44444: {
    //                       example: 'Example',
    //                       type: 'string',
    //                     },
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    //   post: {
    //     operationId: 'dw',
    //     parameters: [
    //       {
    //         name: 'newQueryParameter',
    //         required: true,
    //         in: 'query',
    //         schema: {
    //           example: 'Example',
    //           type: 'string',
    //         },
    //       },
    //       {
    //         name: 'newQueryParameter1',
    //         required: true,
    //         in: 'query',
    //         schema: {
    //           example: 'Example',
    //           type: 'string',
    //         },
    //       },
    //     ],
    //     requestBody: {
    //       content: {
    //         'application/json': {
    //           schema: {
    //             type: 'object',
    //             required: [
    //               'name',
    //             ],
    //             properties: {
    //               name: {
    //                 example: 'Example',
    //                 type: 'string',
    //               },
    //             },
    //           },
    //         },
    //         'application/xml': {
    //           schema: {
    //             type: 'object',
    //             required: [
    //               'newProperty',
    //             ],
    //             properties: {
    //               newProperty: {
    //                 example: 'Example',
    //                 type: 'string',
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     responses: {
    //       200: {
    //         description: '',
    //         content: {
    //           'application/json': {
    //             schema: {
    //               type: 'object',
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    //   put: {
    //     operationId: 'vvvvv下',
    //     responses: {},
    //   },
    //   delete: {
    //     operationId: 'c c xv',
    //     responses: {},
    //   },
    //   head: {
    //     operationId: '555',
    //     responses: {},
    //   },
    //   patch: {
    //     parameters: [
    //       {
    //         name: 'newQueryParameter',
    //         required: true,
    //         in: 'query',
    //         schema: {
    //           example: 'Example',
    //           type: 'string',
    //         },
    //       },
    //       {
    //         name: 'newHeader',
    //         required: true,
    //         in: 'header',
    //         schema: {
    //           example: 'Example',
    //           type: 'string',
    //         },
    //       },
    //     ],
    //     requestBody: {
    //       content: {
    //         'application/json': {
    //           schema: {
    //             type: 'object',
    //           },
    //         },
    //       },
    //     },
    //     responses: {
    //       200: {
    //         description: '',
    //         content: {
    //           'application/json': {
    //             schema: {
    //               type: 'object',
    //               required: [
    //                 'newProperty',
    //               ],
    //               properties: {
    //                 newProperty: {
    //                   example: 'Example',
    //                   type: 'string',
    //                 },
    //               },
    //             },
    //           },
    //           'application/xml': {
    //             schema: {
    //               type: 'object',
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
  },
  'x-amf-security': [
    {
      SecurityScheme: [],
    },
  ],
  'x-NewGroup': {
    name: 'Group',
    description: 'Group annotation',
  },
  components: {
    schemas: {
      BaseResponse4vvvvv: {
        type: 'object',
      },
      data2xx: {
        type: 'object',
        required: ['newProperty', 'newProperty1'],
        properties: {
          newProperty: {
            type: 'object',
            required: ['newProperty', 'newProperty1', 'newProperty2', 'newProperty3'],
            description: 'description',
            properties: {
              newProperty: {
                type: 'object',
                required: ['newProperty'],
                properties: {
                  newProperty: {
                    example: 'Example',
                    type: 'string',
                  },
                },
              },
              newProperty1: {
                type: 'object',
                description: 'hello world',
              },
            },
            'x-dice-merge': [
              {
                $ref: '#/components/schemas/NewDataType1',
              },
            ],
          },
          newProperty1: {
            example: 'Example',
            type: 'string',
          },
        },
        'x-dice-merge': [
          {
            $ref: '#/components/schemas/NewDataType1',
          },
        ],
      },
      NewDataType: {
        type: 'object',
      },
      NewDataType1: {
        type: 'object',
      },
      some_tableg: {
        description: 'hhh',
        type: 'object',
        required: ['id', 'name', 'age'],
        properties: {
          id: {
            example: 1.0,
            type: 'number',
            format: 'int',
          },
          name: {
            example: 'Example',
            type: 'string',
          },
          age: {
            example: 1.0,
            type: 'number',
            format: 'int',
          },
        },
        example: {
          id: 1.0,
          name: 'Example',
          age: 1.0,
        },
      },
    },
    'x-amf-annotationTypes': {
      NewGroup: {
        schema: {},
      },
    },
    'x-amf-securitySchemes': {
      SecurityScheme: {
        type: 'OAuth 1.0',
      },
    },
  },
  tags: [
    {
      description: 'Everything about your Pets',
      externalDocs: {
        description: 'Find out more',
        url: 'http://swagger.io',
      },
      name: 'pet',
    },
    {
      description: 'Access to Petstore orders',
      name: 'store',
    },
    {
      description: 'Operations about user',
      externalDocs: {
        description: 'Find out more about our store',
        url: 'http://swagger.io',
      },
      name: 'user',
    },
  ],
};

export default mock;
