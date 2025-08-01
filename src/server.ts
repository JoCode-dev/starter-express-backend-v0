import app from './app';
import config from './config';
import { logger } from './utils/logger';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});
