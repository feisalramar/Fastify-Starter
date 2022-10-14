import type { FastifyServerOptions } from 'fastify';
import fastify from 'fastify';
import cors from '@fastify/cors';
import mongodb from '@fastify/mongodb';
import jwt from '@fastify/jwt';

import router from '~/plugins/router';
import websocket from '~/plugins/websocket';
import eventsource from '~/plugins/eventsource';
import i18n from '~/plugins/i18n';

const app = async (options: FastifyServerOptions = {}) => {
  const app = fastify(options);
  app.register(import('./error'));

  app.get('/api', async (req, reply) => {
    return {
      name: process.env.APP_NAME,
      env: process.env.NODE_ENV,
    };
  });

  app.register(cors, { origin: process.env.SITE_URL });
  app.register(mongodb, { url: process.env.MONGODB_URL, forceClose: true });
  app.register(jwt, { secret: process.env.SECRET_KEY });

  app.register(router, { prefix: '/api' });
  app.register(websocket, { prefix: '/api' });
  app.register(eventsource, { prefix: '/api' });
  app.register(i18n);

  return app;
};

export default app;