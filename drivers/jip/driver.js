'use strict';

const PlugwiseAdamDriver = require('../../lib/PlugwiseAdamDriver');

module.exports = class PlugwiseAdamJipDriver extends PlugwiseAdamDriver {

  onPairFilterAppliance({ appliance }) {
    if (appliance.type === 'zone_thermometer') return true;
    return false;
  }

};
