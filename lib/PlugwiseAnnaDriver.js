'use strict';

const PlugwiseDriver = require('./PlugwiseDriver');

module.exports = class PlugwiseAnnaDriver extends PlugwiseDriver {

  static get BRIDGE_PRODUCTS() {
    return [
      'smile_thermo',
      'smile-thermo',
    ];
  }

};
