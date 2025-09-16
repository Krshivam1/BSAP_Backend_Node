const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Performance Statistics API',
      version: '1.0.0',
      description: 'Comprehensive API for Performance Statistics Management System - converted from Java Spring Boot to Node.js Express',
      contact: {
        name: 'API Support',
        email: 'support@performancestats.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.performancestats.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login endpoint'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service-to-service communication'
        }
      },
      schemas: {
        // Base response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-09-15T10:30:00.000Z'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Operation failed'
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        example: 'email'
                      },
                      message: {
                        type: 'string',
                        example: 'Email is required'
                      }
                    }
                  }
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-09-15T10:30:00.000Z'
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 10
            },
            total: {
              type: 'integer',
              example: 100
            },
            totalPages: {
              type: 'integer',
              example: 10
            },
            hasNext: {
              type: 'boolean',
              example: true
            },
            hasPrev: {
              type: 'boolean',
              example: false
            }
          }
        },
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            username: {
              type: 'string',
              example: 'john.doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            mobile: {
              type: 'string',
              example: '+91-9876543210'
            },
            designation: {
              type: 'string',
              example: 'Inspector'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            role: {
              $ref: '#/components/schemas/Role'
            },
            state: {
              $ref: '#/components/schemas/State'
            },
            district: {
              $ref: '#/components/schemas/District'
            },
            range: {
              $ref: '#/components/schemas/Range'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        UserCreate: {
          type: 'object',
          required: ['username', 'email', 'password', 'firstName', 'lastName', 'roleId'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              example: 'john.doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'SecurePassword123!'
            },
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'John'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Doe'
            },
            mobile: {
              type: 'string',
              pattern: '^[+]?[0-9]{10,15}$',
              example: '+91-9876543210'
            },
            designation: {
              type: 'string',
              example: 'Inspector'
            },
            roleId: {
              type: 'integer',
              example: 2
            },
            stateId: {
              type: 'integer',
              example: 1
            },
            districtId: {
              type: 'integer',
              example: 1
            },
            rangeId: {
              type: 'integer',
              example: 1
            }
          }
        },
        // Role schemas
        Role: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'ADMIN'
            },
            description: {
              type: 'string',
              example: 'System Administrator'
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        // Geography schemas
        State: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Karnataka'
            },
            code: {
              type: 'string',
              example: 'KA'
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        District: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Bangalore'
            },
            code: {
              type: 'string',
              example: 'BLR'
            },
            stateId: {
              type: 'integer',
              example: 1
            },
            state: {
              $ref: '#/components/schemas/State'
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        Range: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Central Range'
            },
            code: {
              type: 'string',
              example: 'CR'
            },
            districtId: {
              type: 'integer',
              example: 1
            },
            district: {
              $ref: '#/components/schemas/District'
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        // Content schemas
        Module: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Crime Investigation'
            },
            description: {
              type: 'string',
              example: 'Module covering crime investigation procedures'
            },
            displayOrder: {
              type: 'integer',
              example: 1
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        Topic: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Forensic Evidence'
            },
            description: {
              type: 'string',
              example: 'Topic covering forensic evidence collection'
            },
            moduleId: {
              type: 'integer',
              example: 1
            },
            module: {
              $ref: '#/components/schemas/Module'
            },
            displayOrder: {
              type: 'integer',
              example: 1
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        Question: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            questionText: {
              type: 'string',
              example: 'What is the first step in crime scene investigation?'
            },
            questionType: {
              type: 'string',
              enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
              example: 'MULTIPLE_CHOICE'
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    example: 'Secure the crime scene'
                  },
                  isCorrect: {
                    type: 'boolean',
                    example: true
                  }
                }
              }
            },
            correctAnswer: {
              type: 'string',
              example: 'Secure the crime scene'
            },
            marks: {
              type: 'integer',
              example: 5
            },
            difficulty: {
              type: 'string',
              enum: ['EASY', 'MEDIUM', 'HARD'],
              example: 'MEDIUM'
            },
            subTopicId: {
              type: 'integer',
              example: 1
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        // Performance schemas
        PerformanceStatistic: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            userId: {
              type: 'integer',
              example: 1
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            moduleId: {
              type: 'integer',
              example: 1
            },
            module: {
              $ref: '#/components/schemas/Module'
            },
            score: {
              type: 'number',
              format: 'float',
              example: 85.5
            },
            maxScore: {
              type: 'number',
              format: 'float',
              example: 100
            },
            percentage: {
              type: 'number',
              format: 'float',
              example: 85.5
            },
            timeTaken: {
              type: 'integer',
              example: 3600,
              description: 'Time taken in seconds'
            },
            status: {
              type: 'string',
              enum: ['COMPLETED', 'IN_PROGRESS', 'ABANDONED'],
              example: 'COMPLETED'
            },
            submissionDate: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        // Authentication schemas
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'john.doe'
            },
            password: {
              type: 'string',
              example: 'SecurePassword123!'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            expiresIn: {
              type: 'integer',
              example: 3600,
              description: 'Token expiration time in seconds'
            }
          }
        },
        // File schemas
        FileUpload: {
          type: 'object',
          properties: {
            originalName: {
              type: 'string',
              example: 'document.pdf'
            },
            filename: {
              type: 'string',
              example: 'document-1663123456789.pdf'
            },
            mimetype: {
              type: 'string',
              example: 'application/pdf'
            },
            size: {
              type: 'integer',
              example: 1024000
            },
            uploadType: {
              type: 'string',
              enum: ['general', 'images', 'documents', 'spreadsheets'],
              example: 'documents'
            },
            url: {
              type: 'string',
              example: '/api/files/download/document-1663123456789.pdf'
            }
          }
        }
      },
      responses: {
        Success: {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
              }
            }
          }
        },
        BadRequest: {
          description: 'Bad request - validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Unauthorized - authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        Forbidden: {
          description: 'Forbidden - insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search term for filtering results',
          schema: {
            type: 'string'
          }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort field and direction (e.g., name:asc, createdAt:desc)',
          schema: {
            type: 'string',
            pattern: '^[a-zA-Z]+:(asc|desc)$'
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Admin',
        description: 'Administrative functions and system management'
      },
      {
        name: 'Geography',
        description: 'Geographic data management (states, districts, ranges)'
      },
      {
        name: 'Content',
        description: 'Content management (modules, topics, questions)'
      },
      {
        name: 'Performance',
        description: 'Performance statistics and tracking'
      },
      {
        name: 'Communications',
        description: 'Messaging and communication features'
      },
      {
        name: 'Reports',
        description: 'Report generation and analytics'
      },
      {
        name: 'CID',
        description: 'Crime Investigation Department data management'
      },
      {
        name: 'Files',
        description: 'File upload, download, and management'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions: {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        // Add custom headers or modify requests
        req.headers['X-API-Version'] = '1.0.0';
        return req;
      }
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { margin: 20px 0; padding: 10px; background: #f7f7f7; }
    `,
    customSiteTitle: "Performance Statistics API Documentation",
    customfavIcon: "/favicon.ico"
  }
};