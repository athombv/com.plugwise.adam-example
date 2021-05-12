'use strict';

const PlugwiseDevice = require('../../lib/PlugwiseDevice');

module.exports = class PlugwiseSmileP1Device extends PlugwiseDevice {

  onInit(...props) {
    super.onInit(...props);

    if (!this.hasCapability('meter_gas')) {
      this.addCapability('meter_gas').catch(this.error);
    }

    if (!this.hasCapability('meter_power')) {
      this.addCapability('meter_power').catch(this.error);
    }

    if (!this.hasCapability('meter_power.produced')) {
      this.addCapability('meter_power.produced').catch(this.error);
    }

    if (!this.hasCapability('meter_gas')) {
      this.addCapability('meter_gas').catch(this.error);
    }
  }

  onPoll({ payload }) {
    // console.log(JSON.stringify(payload, false, 2));
    super.onPoll({ payload });

    if (!payload) return;
    const { location } = payload;
    const { logs } = location;
    if (!logs) return;

    // measure_power
    if (Array.isArray(logs.point_log)) {
      const log = logs.point_log.filter(log => {
        if (log.type === 'electricity_consumed'
          && log.unit === 'W'
          && log.period
          && log.period.measurement) return true;
        return false;
      }).pop();

      if (log) {
        const value = Array.isArray(log.period.measurement)
          ? log.period.measurement.reduce((total, item) => {
            return total + parseFloat(item.$text);
          }, 0)
          : parseFloat(log.period.measurement.$text);
        this.setCapabilityValue('measure_power', value).catch(this.error);
      }
    }

    // meter_gas
    if (Array.isArray(logs.cumulative_log)) {
      const log = logs.cumulative_log.filter(log => {
        if (log.type === 'gas_consumed'
          && log.unit === 'm3'
          && log.period
          && log.period.measurement) return true;
        return false;
      }).pop();

      if (log) {
        const value = Array.isArray(log.period.measurement)
          ? log.period.measurement.reduce((total, item) => {
            return total + parseFloat(item.$text);
          }, 0)
          : parseFloat(log.period.measurement.$text);
        this.setCapabilityValue('meter_gas', value).catch(this.error);
      }
    }

    // meter_power
    if (Array.isArray(logs.cumulative_log)) {
      const log = logs.cumulative_log.filter(log => {
        if (log.type === 'electricity_consumed'
          && log.unit === 'Wh'
          && log.period
          && log.period.measurement) return true;
        return false;
      }).pop();

      if (log) {
        const value = Array.isArray(log.period.measurement)
          ? log.period.measurement.reduce((total, item) => {
            return total + parseFloat(item.$text) / 1000;
          }, 0)
          : parseFloat(log.period.measurement.$text);
        this.setCapabilityValue('meter_power', value).catch(this.error);
      }
    }

    // meter_power.produced
    if (Array.isArray(logs.cumulative_log)) {
      const log = logs.cumulative_log.filter(log => {
        if (log.type === 'electricity_produced'
          && log.unit === 'W'
          && log.period
          && log.period.measurement) return true;
        return false;
      }).pop();

      if (log) {
        const value = Array.isArray(log.period.measurement)
          ? log.period.measurement.reduce((total, item) => {
            return total + parseFloat(item.$text);
          }, 0)
          : parseFloat(log.period.measurement.$text);
        this.setCapabilityValue('meter_power.produced', value).catch(this.error);
      }
    }
  }

};
