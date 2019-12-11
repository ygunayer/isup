const pg = require('pg');
const redis = require('redis');
const amqp = require('amqplib');
const request = require('request');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkPostgres(url) {
  const client = new pg.Client({connectionString: url});
  try {
    await client.connect();
    await client.query('SELECT NOW()');
    client.end();
  } catch (err) {
    client.end()
    throw err;
  }
}

async function checkRabbitMQ(url) {
  await amqp.connect(url);
}

async function checkRedis(url) {
  return new Promise((resolve, reject) => {
    const client = redis.createClient({url});
    client.on('error', err => reject(err));
    client.keys('*', (err, keys) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function checkElasticsearch(url) {
  return new Promise((resolve, reject) => {
    request({url: `${url}/_cluster/health`, json: true}, (err, response, body) => {
      if (err) return reject(err);
      if (body.status == 'red') return reject(new Error(`Elasticsearch at ${url} is available but the cluster health is RED`));
      resolve();
    });
  });
}

async function checkInfluxDB(url) {
  return new Promise((resolve, reject) => {
    request({url: `${url}/ping`}, (err, response) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

const CheckSpecs = {
  postgres: {
    envName: 'POSTGRES',
    check: checkPostgres
  },
  redis: {
    envName: 'REDIS',
    check: checkRedis
  },
  rabbitmq: {
    envName: 'RABBITMQ',
    check: checkRabbitMQ
  },
  influxdb: {
    envName: 'INFLUXDB',
    check: checkInfluxDB
  },
  elasticsearch: {
    envName: 'ELASTICSEARCH',
    check: checkElasticsearch
  }
};

async function checkAll() {
  const allChecks = Object.keys(CheckSpecs)
    .reduce((acc, key) => {
      const {envName, check} = CheckSpecs[key];
      const envValue = process.env[envName];
      //const timeoutValue = process.env[`${envName}_TIMEOUT`];

      const checks = (envValue || '').split(',')
        .map(s => s.trim())
        .filter(s => !!s)
        .map(url => check(url));

      return acc.concat(checks);
    }, []);

  if (allChecks.length < 1) {
    throw new Error('Please specify at least one service URL to check.');
  }

  await Promise.all(allChecks);
}

module.exports = {
  delay,
  CheckSpecs,
  checkAll,
  checkElasticsearch,
  checkRedis,
  checkPostgres,
  checkInfluxDB,
  checkRabbitMQ
};
