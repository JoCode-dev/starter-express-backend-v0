import express, { NextFunction, Request, Response, Router } from 'express';
import { logger } from '../utils/logger';
import userRoutes from './v1/user.route';

const router = Router();

export default (): Router => {
  /** Log the Request */
  router.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(
      `Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`,
    );

    res.on('finish', () => {
      /**
       * Log the response
       */
      logger.info(`Outgoing -> Method: [${req.method}] - 
                Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
    });

    next();
  });

  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());

  /**
   * Rules for the API
   * 1. Use nouns but no verbs
   * 2. Use plural nouns
   * 3. Use sub-resources for relations
   * 4. Use HTTP methods
   * 5. Be specific
   * 6. Consider versions
   * 7. Handle errors gracefully
   * 8. Use query component for filtering
   * 9. Use limit and offset for pagination
   * 10. Use HATEOAS
   */

  /**
   * Accept: application/json
   * Content-Type: application/json
   * Access-Control-Allow-Origin: *
   */
  router.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
    res.header('Accept', 'application/json');

    // Accept methods GET, POST, PUT, DELETE, PATCH
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    next();
  });

  /** Health Check */
  /**
   * @openapi
   * /health:
   *   get:
   *     tags:
   *       - Health
   *     summary: Health check
   *     description: Check if the server is running
   *     responses:
   *       200:
   *         description: Server is up and running
   */
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      message: 'Server is up and running',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ hello: 'Hello World' });
  });

  /** Project Routes */
  propertyRoutes(router);
  leadRoutes(router);
  campaignRoutes(router);
  interactionRoutes(router);
  campaignRecipientsRoutes(router);
  userRoutes(router);

  /** Error handling */
  router.use((req: Request, res: Response) => {
    const error = new Error('not found');
    logger.error(error.message);
    res.status(404).json({ message: error.message });
  });

  return router;
};
