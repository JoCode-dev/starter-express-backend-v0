import chalk from 'chalk';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import { logger } from './utils/logger';

import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { handle404Error } from './utils/errors';
import { connectRedis } from './lib/redis';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Logger Morgan personnalisé avec Chalk
const morganFormat = (tokens: any, req: any, res: any) => {
  const status = res.statusCode;
  let color = chalk.green;
  if (status >= 500) color = chalk.red;
  else if (status >= 400) color = chalk.yellow;
  else if (status >= 300) color = chalk.cyan;
  return [
    logger.info(chalk.gray(tokens.method(req, res))),
    logger.info(chalk.white(tokens.url(req, res))),
    logger.info(color(status)),
    logger.info(chalk.gray(tokens['response-time'](req, res) + ' ms')),
  ].join(' ');
};

app.use(morgan(morganFormat));

// Routes
app.use('/api/v1', routes());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to Redis
connectRedis();

app.all('*', handle404Error);

app.use(errorHandler);

export default app;
