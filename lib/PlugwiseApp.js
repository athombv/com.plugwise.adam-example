'use strict';

const Homey = require('homey');
const PlugwiseDiscovery = require('./PlugwiseDiscovery');

module.exports = class PlugwiseApp extends Homey.App {

  onInit() {
    this.discovery = new PlugwiseDiscovery();
    this.discovery.on('__log', (...args) => this.log('[PlugwiseDiscovery]', ...args));
    this.discovery.on('__error', (...args) => this.error('[PlugwiseDiscovery]', ...args));
  }

  getBridges() {
    return this.discovery.bridges;
  }

  async getBridge({ bridgeId }) {
    if (this.discovery.bridges[bridgeId]) {
      return this.discovery.bridges[bridgeId];
    }

    return new Promise(resolve => {
      this.discovery.once(`bridge:${bridgeId}`, resolve);
    });
  }

};
