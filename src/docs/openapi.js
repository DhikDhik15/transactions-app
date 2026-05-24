const errorResponse = (status, message) => ({
  description: message,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ApiResponse' },
      example: {
        status,
        message,
        data: null,
      },
    },
  },
});

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Contract SIMS PPOB',
    version: '1.0.0',
    description: 'Dokumentasi API untuk membership, informasi, saldo, topup, transaksi, dan history.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],
  tags: [
    { name: '1. Module Membership' },
    { name: '2. Module Information' },
    { name: '3. Module Transaction' },
  ],
  paths: {
    '/registration': {
      post: {
        tags: ['1. Module Membership'],
        summary: 'Registrasi user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegistrationRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Registrasi berhasil',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
                example: {
                  status: 0,
                  message: 'Registrasi berhasil silahkan login',
                  data: null,
                },
              },
            },
          },
          400: errorResponse(102, 'Paramter email tidak sesuai format'),
        },
      },
    },
    '/login': {
      post: {
        tags: ['1. Module Membership'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login sukses',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
                example: {
                  status: 0,
                  message: 'Login Sukses',
                  data: { token: 'jwt-token' },
                },
              },
            },
          },
          400: errorResponse(102, 'Paramter email tidak sesuai format'),
          401: errorResponse(103, 'Username atau password salah'),
        },
      },
    },
    '/profile': {
      get: {
        tags: ['1. Module Membership'],
        summary: 'Get profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Sukses',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
                example: {
                  status: 0,
                  message: 'Sukses',
                  data: {
                    email: 'user@nutech-integrasi.com',
                    first_name: 'User',
                    last_name: 'Nutech',
                    profile_image: 'https://yoururlapi.com/profile.jpeg',
                  },
                },
              },
            },
          },
          401: errorResponse(108, 'Token tidak tidak valid atau kadaluwarsa'),
        },
      },
    },
    '/profile/update': {
      put: {
        tags: ['1. Module Membership'],
        summary: 'Update profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Update profile berhasil',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
          401: errorResponse(108, 'Token tidak tidak valid atau kadaluwarsa'),
        },
      },
    },
    '/profile/image': {
      put: {
        tags: ['1. Module Membership'],
        summary: 'Upload profile image',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Update image berhasil',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
          400: errorResponse(102, 'Format Image tidak sesuai'),
          401: errorResponse(108, 'Token tidak tidak valid atau kadaluwarsa'),
        },
      },
    },
    '/banner': {
      get: {
        tags: ['2. Module Information'],
        summary: 'List banner',
        responses: {
          200: {
            description: 'Sukses',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/services': {
      get: {
        tags: ['2. Module Information'],
        summary: 'List service',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Sukses',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
          401: errorResponse(108, 'Token tidak tidak valid atau kadaluwarsa'),
        },
      },
    },
    '/balance': {
      get: {
        tags: ['3. Module Transaction'],
        summary: 'Get balance',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Get Balance Berhasil',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
                example: {
                  status: 0,
                  message: 'Get Balance Berhasil',
                  data: { balance: 1000000 },
                },
              },
            },
          },
          401: errorResponse(108, 'Token tidak tidak valid atau kadaluwarsa'),
        },
      },
    },
    '/topup': {
      post: {
        tags: ['3. Module Transaction'],
        summary: 'Top up balance',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TopUpRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Top up berhasil',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
                example: {
                  status: 0,
                  message: 'Top Up Balance berhasil',
                  data: { balance: 2000000 },
                },
              },
            },
          },
          400: errorResponse(102, 'Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0'),
          401: errorResponse(108, 'Token tidak tidak valid atau kadaluwarsa'),
        },
      },
    },
    '/transaction': {
      post: {
        tags: ['3. Module Transaction'],
        summary: 'Buat transaksi pembayaran',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TransactionRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Transaksi berhasil',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
          400: errorResponse(102, 'Service ataus Layanan tidak ditemukan'),
          401: errorResponse(108, 'Token tidak tidak valid atau kadaluwarsa'),
        },
      },
    },
    '/transaction/history': {
      get: {
        tags: ['3. Module Transaction'],
        summary: 'History transaksi',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'offset', in: 'query', schema: { type: 'integer', example: 0 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 3 } },
        ],
        responses: {
          200: {
            description: 'Get History Berhasil',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
          401: errorResponse(108, 'Token tidak tidak valid atau kadaluwarsa'),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          status: { type: 'integer', example: 0 },
          message: { type: 'string' },
          data: { nullable: true },
        },
      },
      RegistrationRequest: {
        type: 'object',
        required: ['email', 'first_name', 'last_name', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@nutech-integrasi.com' },
          first_name: { type: 'string', example: 'User' },
          last_name: { type: 'string', example: 'Nutech' },
          password: { type: 'string', minLength: 8, example: 'abcdef1234' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@nutech-integrasi.com' },
          password: { type: 'string', minLength: 8, example: 'abcdef1234' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        required: ['first_name', 'last_name'],
        properties: {
          first_name: { type: 'string', example: 'User Edited' },
          last_name: { type: 'string', example: 'Nutech Edited' },
        },
      },
      TopUpRequest: {
        type: 'object',
        required: ['top_up_amount'],
        properties: {
          top_up_amount: { type: 'integer', minimum: 1, example: 1000000 },
        },
      },
      TransactionRequest: {
        type: 'object',
        required: ['service_code'],
        properties: {
          service_code: { type: 'string', example: 'PULSA' },
        },
      },
    },
  },
};

const swaggerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SIMS PPOB API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
      .swagger-ui .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>`;

module.exports = {
  openApiSpec,
  swaggerHtml,
};
