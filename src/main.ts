import app from './app';

const start = async () => {
  const server = await app({ logger: true });

  try {
    server.listen({
      host: process.env.HOST,
      port: process.env.PORT
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
