'use strict';
/**
 * db config
 * @type {Object}
 */
export default {
  type: 'mysql',
  adapter: {
    mysql: {
      host: '127.0.0.1',
      port: '3307',
      database: 'alpha',
      user: 'root',
      password: '123456',
      prefix: 'alpha_',
      encoding: 'UTF8MB4_GENERAL_CI'
    },
    mongo: {

    }
  }
};
