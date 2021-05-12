'use strict';

const PlugwiseAdamDriver = require('../../lib/PlugwiseAdamDriver');

module.exports = class PlugwiseAdamHADriver extends PlugwiseAdamDriver {

  onPairFilterAppliance({ appliance }) {
    if (appliance.type === 'heater_central') return true;
    return false;
  }

};
