'use strict';

const PlugwiseAdamDriver = require('../../lib/PlugwiseAdamDriver');

module.exports = class PlugwiseAdamPlugDriver extends PlugwiseAdamDriver {

  onPairFilterAppliance({ appliance }) {
    if (appliance.type === 'zz_misc') return true;
    if (appliance.type === 'central_heating_pump') return true;
    return false;
  }

};
