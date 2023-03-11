require('dotenv').config();
const Joi = require('joi');

const sanitizeRedisUrl = url => url.replace(/^(redis\:\/\/)/, '');

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(8000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_HOST: Joi.string(),
    REDIS_PASSWORD: Joi.string(),
    REDIS_ENDPOINT_URI: Joi.string().default('127.0.0.1:6379').description('Redis url'),
    MANAGEMENT_APP_URL: Joi.string().default('localhost:8092').description('Management App url'),
    SHOP_APP_URL: Joi.string().required().description('Management App url'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  redis: {
    endpointUri: envVars.REDIS_ENDPOINT_URI
      ? sanitizeRedisUrl(envVars.REDIS_ENDPOINT_URI)
      : `${sanitizeRedisUrl(envVars.REDIS_HOST)}:${envVars.REDIS_PORT}`
      ,
    password: envVars.REDIS_PASSWORD || undefined
  },
  managementAppUrl: envVars.MANAGEMENT_APP_URL,
  shopAppUrl: envVars.SHOP_APP_URL,
};
