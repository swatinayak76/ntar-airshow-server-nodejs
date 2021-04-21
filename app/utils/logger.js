const { createLogger, format, transports } = require('winston');

const httpTransportOptions = {
    host: 'http-intake.logs.datadoghq.com',
    path: `/v1/input/${process.env.DATADOG}?ddsource=nodejs&service=azureapp`,
    ssl: false
  };


  const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format: format.json(),
    transports: [
      new transports.Http(httpTransportOptions),
    ],
  });
  
  module.exports = logger;
  
  // Example logs
  logger.log('info', 'Hello simple log!');
  logger.info('Hello log with metas',{color: 'blue' });