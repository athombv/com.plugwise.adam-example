'use strict';

const PlugwiseDriver = require('./PlugwiseDriver');

module.exports = class PlugwiseAdamDriver extends PlugwiseDriver {

  static get BRIDGE_PRODUCTS() {
    return ['smile_open_therm'];
  }

};
