'use strict';

const PlugwiseAdamDevice = require('../../lib/PlugwiseAdamDevice');

module.exports = class PlugwiseAdamJipDevice extends PlugwiseAdamDevice {

  onPoll({ appliance }) {
    // console.log(JSON.stringify(appliance, false, 2));

    if (appliance) {
      if (appliance.logs
       && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'temperature'
            && log.unit === 'C'
            && log.period
            && log.period.measurement) {
            const value = parseFloat(log.period.measurement.$text);
            this.setCapabilityValue('measure_temperature', value).catch(this.error);
          }
        });
      }
    }
  }

};
