import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => logger.error('Redis Client Error: ' + err));

export async function connectRedis() {
  await redisClient.connect();
  logger.info('Connecté à Redis');
} 