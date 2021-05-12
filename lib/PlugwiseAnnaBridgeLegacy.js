'use strict';

const PlugwiseBridge = require('./PlugwiseBridge');

// This class is for Anna with firmware 1.x

module.exports = class PlugwiseAnnaBridgeLegacy extends PlugwiseBridge {

  async ping({ password } = {}) {
    return this._call({
      password,
      path: '/system',
    });
  }

  async setTargetTemperature({ applianceId, setpoint }) {
    const appliance = await this.getAppliance({ id: applianceId });
    const functionalityId = appliance.actuator_functionalities.thermostat_functionality.$attr.id;

    return this._call({
      method: 'put',
      path: `/core/appliances;id=${applianceId}/thermostat;id=${functionalityId}`,
      xml: `<thermostat_functionality><setpoint>${setpoint}</setpoint></thermostat_functionality>`,
    });
  }

  async setPreset({ applianceId, preset }) {
    const rules = await this.getRules();
    const rule = rules.find(rule => {
      return rule.name.includes(preset);
    });
    if (!rule) {
      throw new Error('Invalid preset');
    }

    return this._call({
      method: 'post',
      path: '/core/rules',
      xml: `<rules><rule id="${rule.$attr.id}"><active>true</active></rule></rules>`,
    });
  }

};
