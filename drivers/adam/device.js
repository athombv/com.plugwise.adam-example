'use strict';

const Homey = require('homey');
const PlugwiseAdamDevice = require('../../lib/PlugwiseAdamDevice');

module.exports = class PlugwiseAdamHADevice extends PlugwiseAdamDevice {

  onInit(...props) {
    super.onInit(...props);

    this.registerCapabilityListener('DHW_mode', this.onCapabilityDHWmode.bind(this));

    this._setDHWmodeAction = new Homey.FlowCardAction('Set_DHW_mode')
      .register().registerRunListener(this._setDHWmodeRunListener.bind(this));
  }

  onPoll({ appliance }) {
    // console.log(JSON.stringify(appliance, false, 2));

    if (appliance) {
      // modulation_level
      if (appliance.logs
      && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'modulation_level'
            && log.period
            && log.period.measurement) {
            const value = parseFloat(log.period.measurement.$text) * 100;
            this.setCapabilityValue('modulation_level', value).catch(this.error);
          }
        });
      }

      // Boiler_state
      if (appliance.logs
      && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'central_heating_state'
            && log.period
            && log.period.measurement) {
            const state = log.period.measurement.$text;
            this.setCapabilityValue('boiler_state', state === 'on').catch(this.error);
          }
        });
      }

      // DHW_state
      if (appliance.logs
      && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'domestic_hot_water_state'
            && log.period
            && log.period.measurement) {
            const state = log.period.measurement.$text;
            this.setCapabilityValue('DHW_state', state === 'on').catch(this.error);
          }
        });
      }

      // measure_temperature.intended
      if (appliance.logs
      && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'intended_boiler_temperature'
            && log.unit === 'C'
            && log.period
            && log.period.measurement) {
            const value = Math.round(parseFloat(log.period.measurement.$text) * 10) / 10;
            if (this.getCapabilityValue('measure_temperature.intended') !== value) {
              this.setCapabilityValue('measure_temperature.intended', value).catch(this.error);
            }
          }
        });
      }

      // measure_temperature.boiler
      if (appliance.logs
      && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'boiler_temperature'
            && log.unit === 'C'
            && log.period
            && log.period.measurement) {
            const value = Math.round(parseFloat(log.period.measurement.$text) * 10) / 10;
            if (this.getCapabilityValue('measure_temperature.boiler') !== value) {
              this.setCapabilityValue('measure_temperature.boiler', value).catch(this.error);
            }
          }
        });
      }

      // measure_temperature.return
      if (appliance.logs
      && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'return_water_temperature'
            && log.unit === 'C'
            && log.period
            && log.period.measurement) {
            const value = Math.round(parseFloat(log.period.measurement.$text) * 10) / 10;
            if (this.getCapabilityValue('measure_temperature.return') !== value) {
              this.setCapabilityValue('measure_temperature.return', value).catch(this.error);
            }
          }
        });
      }

      // Boiler_status_code
      if (appliance.logs
      && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'open_therm_application_specific_fault_code'
            && log.period
            && log.period.measurement) {
            const value = parseFloat(log.period.measurement.$text);
            this.setCapabilityValue('boiler_status_code', value).catch(this.error);
          }
        });
      }

      // boiler_error_code
      if (appliance.logs
      && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'open_therm_oem_fault_code'
            && log.period
            && log.period.measurement) {
            const value = parseFloat(log.period.measurement.$text);
            this.setCapabilityValue('boiler_error_code', value).catch(this.error);
          }
        });
      }

      // DHW_mode
      if (appliance.logs
      && Array.isArray(appliance.logs.point_log)) {
        appliance.logs.point_log.forEach(log => {
          if (log.type === 'domestic_hot_water_comfort_mode'
            && log.period
            && log.period.measurement) {
            const state = log.period.measurement.$text;
            this.setCapabilityValue('DHW_mode', state).catch(this.error);
          }
        });
      }
    }
  }

  async onCapabilityDHWmode(value) {
    return this.bridge.setDHWmode({
      applianceId: this.applianceId,
      mode: value,
    });
  }

  async _setDHWmodeRunListener(args) {
    if (!args.mode) {
      throw new Error('mode_property_missing');
    }

    return args.device.bridge.setDHWmode({
      applianceId: this.applianceId,
      mode: args.mode,
    });
  }

};
