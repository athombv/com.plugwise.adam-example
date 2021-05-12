'use strict';

const PlugwiseDevice = require('./PlugwiseDevice');

module.exports = class PlugwiseThermostatDevice extends PlugwiseDevice {

  onInit(...props) {
    super.onInit(...props);

    this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
  }

  onPoll({ appliance }) {
    if (appliance) {
      // console.log(JSON.stringify(appliance, false, 2));

      if (appliance.actuator_functionalities
       && appliance.actuator_functionalities.thermostat_functionality) {
        const { setpoint } = appliance.actuator_functionalities.thermostat_functionality;
        const value = parseFloat(setpoint);
        this.setCapabilityValue('target_temperature', value).catch(this.error);
      }

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

          if (log.type === 'preset_state'
            && log.preset_state) {
            const presetId = log.preset_state.$attr.id;
            if (this.lastKnownPresetId !== presetId) {
              this.lastKnownPresetId = presetId;
              // TODO
            }
          }
        });
      }
    }
  }

  async onCapabilityTargetTemperature(value) {
    const { applianceId } = this;

    return this.bridge.setTargetTemperature({
      applianceId,
      setpoint: value,
    });
  }

};
