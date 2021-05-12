'use strict';

const Homey = require('homey');
const PlugwiseAdamDriver = require('../../lib/PlugwiseAdamDriver');

module.exports = class PlugwiseAdamZoneDriver extends PlugwiseAdamDriver {

  async onInit() {
    await super.onInit();

    new Homey.FlowCardAction('set_preset')
      .register()
      .registerRunListener(async ({ device, preset }) => {
        return device.setPreset(preset);
      });
  }

  async onPairListDevices({ bridge }) {
    const locations = await bridge.getLocations();
    return locations.filter(location => {
      return location.type !== 'building'; // Home
    }).map(location => {
      return {
        name: location.name,
        data: {
          bridgeId: bridge.id,
          locationId: location.$attr.id,
        },
        store: {
          password: bridge.password,
        },
      };
    });
  }

};
