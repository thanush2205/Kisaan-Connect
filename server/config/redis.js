const { createClient } = require('redis');

let redisClient = null;

function initializeRedis() {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL is not configured. Redis caching is disabled.');
    return null;
  }

  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (error) => {
    console.error('Redis error:', error.message);
  });

  redisClient.connect().then(() => {
    console.log('Connected to Redis');
  }).catch((error) => {
    console.error('Redis connection failed:', error.message);
    redisClient = null;
  });

  return redisClient;
}

function getRedisClient() {
  return redisClient?.isReady ? redisClient : null;
}

module.exports = {
  initializeRedis,
  getRedisClient
};
