require('dotenv').config({ quiet: true });

const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const { openApiSpec, swaggerHtml } = require('./docs/openapi');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      name: 'Transactions REST API',
      docs: '/api-docs',
      openapi: '/swagger.json',
    });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/swagger.json', (req, res) => {
    res.json(openApiSpec);
  });

  app.get(['/api-docs', '/docs'], (req, res) => {
    res.type('html').send(swaggerHtml);
  });

  app.use('/', routes);
  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
