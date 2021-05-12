'use strict';

const { SimpleClass, ManagerDiscovery } = require('homey');
const fetch = require('node-fetch');
const PlugwiseAdamBridge = require('./PlugwiseAdamBridge');
const PlugwiseAnnaBridge = require('./PlugwiseAnnaBridge');
const PlugwiseAnnaBridgeLegacy = require('./PlugwiseAnnaBridgeLegacy');
const PlugwiseSmileP1Bridge = require('./PlugwiseSmileP1Bridge');

module.exports = class PlugwiseDiscovery extends SimpleClass {

  static get BRIDGES() {
    return {
      smile_open_therm: PlugwiseAdamBridge,
      smile_thermo: PlugwiseAnnaBridge,
      'smile-thermo': PlugwiseAnnaBridgeLegacy,
      smile: PlugwiseSmileP1Bridge,
    };
  }

  constructor() {
    super();

    this._bridges = {};

    this._discoveryStrategy = ManagerDiscovery.getDiscoveryStrategy('plugwise');
    this._discoveryStrategy.on('result', discoveryResult => this.onDiscoveryResult(discoveryResult));

    Object.values(this._discoveryStrategy.getDiscoveryResults())
      .map(discoveryResult => this.onDiscoveryResult(discoveryResult));
  }

  onDiscoveryResult(discoveryResult) {
    const bridgeName = discoveryResult.name;
    const bridgeAddress = discoveryResult.address;
    const bridgeVersion = discoveryResult.txt.version;
    const bridgeProduct = discoveryResult.txt.product;
    const bridgeId = discoveryResult.host
      .replace('.local', '')
      .replace('smile', '');

    fetch(`http://${bridgeAddress}`).then(res => {
      const server = res.headers.get('server');
      if (!server || !server.toLowerCase().includes('plugwise')) return;

      if (this._bridges[bridgeId]) {
        if (this._bridges[bridgeId].address !== bridgeAddress) {
          this.log(`Bridge ${bridgeId} changed address from ${this._bridges[bridgeId].address} to ${bridgeAddress}`);
          this._bridges[bridgeId].address = bridgeAddress;
        }

        if (this._bridges[bridgeId].version !== bridgeVersion) {
          this.log(`Bridge ${bridgeId} changed version from ${this._bridges[bridgeId].version} to ${bridgeVersion}`);
          this._bridges[bridgeId].version = bridgeVersion;
        }
      } else {
        const PlugwiseBridge = this.constructor.BRIDGES[bridgeProduct];
        if (!PlugwiseBridge) {
          throw new Error(`Unspported product: ${bridgeProduct}`);
        }

        const bridge = new PlugwiseBridge({
          id: bridgeId,
          address: bridgeAddress,
          version: bridgeVersion,
          name: bridgeName,
          product: bridgeProduct,
        });
        this._bridges[bridgeId] = bridge;
        this.emit('bridge', bridge);
        this.emit(`bridge:${bridge.id}`, bridge);
        this.log('Found', bridge.constructor.name, bridge.product, bridge.id, bridge.version, bridge.address);
      }
    }).catch(this.error);
  }

  get bridges() {
    return this._bridges;
  }

};
