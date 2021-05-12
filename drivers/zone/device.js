'use strict';

const PlugwiseAdamDevice = require('../../lib/PlugwiseAdamDevice');

module.exports = class PlugwiseAdamZoneDevice extends PlugwiseAdamDevice {

  onInit(...props) {
    super.onInit(...props);

    this.registerCapabilityListener('location_preset', this.onCapabilityLocationPreset.bind(this));
    this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
  }

  onPoll({ location }) {
    // console.log(JSON.stringify(location, false, 2));

    if (location) {
      this.setCapabilityValue('location_preset', location.preset || null).catch(this.error);

      if (location.actuator_functionalities
      && location.actuator_functionalities.thermostat_functionality) {
        const { setpoint } = location.actuator_functionalities.thermostat_functionality;
        const value = parseFloat(setpoint);
        this.setCapabilityValue('target_temperature', value).catch(this.error);
      }

      if (location.logs
      && Array.isArray(location.logs.point_log)) {
        location.logs.point_log.forEach(log => {
          if (log.type === 'temperature'
            && log.unit === 'C'
            && log.period
            && log.period.measurement) {
            const value = parseFloat(log.period.measurement.$text);
            this.setCapabilityValue('measure_temperature', value).catch(this.error);
          }
        });
      }

      if (location.logs
      && Array.isArray(location.logs.point_log)) {
        location.logs.point_log.forEach(log => {
          if (log.type === 'electricity_consumed'
            && log.unit === 'W'
            && log.period
            && log.period.measurement) {
            const value = parseFloat(log.period.measurement.$text);
            this.setCapabilityValue('measure_power', value).catch(this.error);
          }
        });
      }
    }
  }

  async onCapabilityLocationPreset(value) {
    await this.setPreset(value);
  }

  async onCapabilityTargetTemperature(value) {
    // TODO: Maybe cache these two calls. For now it's pretty fast and shouldn't happen often
    const location = await this.bridge.getLocation({ id: this.locationId });

    if (location
     && location.actuator_functionalities
     && location.actuator_functionalities.thermostat_functionality) {
      const { id: locationId } = location.$attr;
      const { id: thermostatId } = location.actuator_functionalities.thermostat_functionality.$attr;
      return this.bridge.setThermostat({
        thermostatId,
        locationId,
        setpoint: value,
      });
    }

    throw new Error('Unknown Error');
  }

  async setPreset(preset) {
    const { locationId } = this;
    return this.bridge.setPreset({ locationId, preset });
  }

};
