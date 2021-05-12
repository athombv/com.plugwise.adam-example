'use strict';

const PlugwiseAdamDriver = require('../../lib/PlugwiseAdamDriver');

module.exports = class PlugwiseAdamValveDriver extends PlugwiseAdamDriver {

  onPairFilterAppliance({ appliance }) {
    return appliance.type === 'thermostatic_radiator_valve';
  }

};
