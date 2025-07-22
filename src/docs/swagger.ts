import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drinkeat API',
      version: '1.0.0',
      description: 'Documentation de l’API de I2C',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          persistAuthorization: true,
          description: 'JWT token d’authentification. Format: Bearer <token>',
          in: 'header',
          name: 'Authorization',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Développement' },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/docs/schemas/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
