"use strict";
/*
 * @file
 * Log.js
 *
 * Logs messages using a logging service.
 */

const winston = require('winston');

module.exports = class Log {
  constructor() {
    this._logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      //defaultMeta: { service: 'user-service' },
      transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
      exitOnError: false
    });

    //if (process.env.NODE_ENV !== 'production') {
    this._logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
    //}
  }

  info(msg, ...args) {
    this._logger.info(msg, args); 
  }

  error(msg, ...args) {
    this._logger.error(msg, args); 
  }

  /**
   * Get the name of the current function or class+method that's being
   * executed when this was called.
   *
   * Yes, the implementation is a hack, because we're operating in 'strict'
   * mode and cannot access arguments.callee.name.
   *
   * See:
   * https://stackoverflow.com/questions/38435450/get-current-function-name-in-strict-mode
   *
   * @return string
   */
  static get currentFn() {
    const stack = new Error().stack;
    return stack.split("\n")[2].trim().split(" ")[1].trim();
  }

}
