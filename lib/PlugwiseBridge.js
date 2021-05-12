'use strict';

const { EventEmitter } = require('events');
const fetch = require('node-fetch');
const xmlParser = require('fast-xml-parser');

module.exports = class PlugwiseBridge extends EventEmitter {

  static get POLL_INTERVAL() {
    return 5000;
  }

  static get POLL_CLASSES() {
    return ['Appliance', 'Location'];
  }

  static get TYPES() {
    return [];
  }

  constructor({
    id,
    name,
    address,
    version,
    product,
    password,
  }) {
    super();

    this._id = id;
    this._name = name;
    this._address = address;
    this._version = version;
    this._product = product;
    this._password = password;

    this._poll = this._poll.bind(this);
    this._pollCounter = 0;
  }

  /*
   * Getters & Setters
   */

  get name() {
    return this._name;
  }

  get id() {
    return this._id;
  }

  get version() {
    return this._version || null;
  }

  set version(version) {
    this._version = version;
  }

  get address() {
    return this._address || null;
  }

  set address(address) {
    this._address = address;
  }

  get password() {
    return this._password || null;
  }

  set password(password) {
    this._password = password;
  }

  get product() {
    return this._product || null;
  }

  set product(product) {
    this._product = product;
  }

  /*
  * Polling
  */

  enablePolling() {
    this._pollCounter++;
    if (this.pollInterval) return;
    this.pollInterval = setInterval(this._poll, this.constructor.POLL_INTERVAL);
  }

  stopPolling() {
    this._pollCounter--;
    if (this._pollCounter > 0) return;
    if (!this.pollInterval) return;
    clearInterval(this.pollInterval);
  }

  _poll() {
    this.getDomainObjects({
      classes: this.constructor.POLL_CLASSES,
    })
      .then(payload => {
        // Any
        this.emit('poll', payload);

        // Appliance
        if (payload.appliance) {
          [].concat(payload.appliance).forEach(appliance => {
            if (!appliance) return;
            this.emit(`appliance:${appliance.$attr.id}:poll`, appliance);
          });
        }

        // Location
        if (payload.location) {
          [].concat(payload.location).forEach(location => {
            if (!location) return;
            this.emit(`location:${location.$attr.id}:poll`, location);
          });
        }
      }).catch(() => {});
  }

  /*
   * Bridge methods
   */

  async testPassword({ password }) {
    try {
      await this.ping({ password });
      return true;
    } catch (err) {
      if (err.code === 401) return false;
      throw err;
    }
  }

  async ping({ password } = {}) {
    return this._call({
      password,
      path: '/core/gateways;ping',
    });
  }

  async getDomainObjects({
    id,
    classes = ['Gateway', 'Location', 'Module', 'Template', 'Appliance'],
  } = {}) {
    let path = '/core/domain_objects';

    if (classes) {
      path += `;class=${classes}`;
    }

    if (id) {
      path += `;id=${id}`;
    }

    return this._call({
      path,
    // eslint-disable-next-line camelcase
    }).then(({ domain_objects }) => domain_objects);
  }

  async getGateway() {
    const { gateway } = await this.getDomainObjects({
      classes: 'Gateway',
    });
    return gateway;
  }

  async getModules() {
    const { module } = await this.getDomainObjects({
      classes: 'Module',
    });
    return module;
  }

  async getAppliance({ id }) {
    const { appliance } = await this.getDomainObjects({
      id,
      classes: 'Appliance',
    });
    return appliance;
  }

  async getAppliances() {
    const { appliance } = await this.getDomainObjects({
      classes: 'Appliance',
    });
    return appliance;
  }

  async getTemplates() {
    const { template } = await this.getDomainObjects({
      classes: 'Template',
    });
    return template;
  }

  async getLocation({ id }) {
    const { location } = await this.getDomainObjects({
      id,
      classes: 'Location',
    });
    return location;
  }

  async getLocations() {
    const { location } = await this.getDomainObjects({
      classes: 'Location',
    });
    return location;
  }

  async setRelay({ applianceId, on }) {
    return this._call({
      method: 'put',
      path: `/core/appliances;id=${applianceId}/relay`,
      xml: `<relay><state>${on ? 'on' : 'off'}</state></relay>`,
    });
  }

  async setThermostat({ locationId, thermostatId, setpoint }) {
    return this._call({
      method: 'put',
      path: `/core/locations;id=${locationId}/thermostat;id=${thermostatId}`,
      xml: `<thermostat_functionality><setpoint>${setpoint}</setpoint></thermostat_functionality>`,
    });
  }

  async setPreset({ locationId, preset }) {
    return this._call({
      method: 'put',
      path: `/core/locations;id=${locationId}`,
      xml: `<locations><location id="${locationId}"><preset>${preset}</preset></location></locations>`,
    });
  }

  async setDHWmode({ applianceId, mode }) {
    return this._call({
      method: 'put',
      path: `/core/appliances;id=${applianceId}/toggle;type=domestic_hot_water_comfort_mode`,
      xml: `<toggle><state>${mode}</state></toggle>`,
    });
  }

  async setTargetTemperature({ applianceId, setpoint }) {
    const locationId = await this.getApplianceLocationId({ applianceId });
    const location = await this.getLocation({ id: locationId });

    if (location
     && location.actuator_functionalities
     && location.actuator_functionalities.thermostat_functionality) {
      const { id: locationId } = location.$attr;
      const { id: thermostatId } = location.actuator_functionalities.thermostat_functionality.$attr;

      return this.setThermostat({
        thermostatId,
        locationId,
        setpoint,
      });
    }

    throw new Error('Unknown Error');
  }

  async getApplianceLocationId({ applianceId }) {
    const appliance = await this.getAppliance({ id: applianceId });
    if (!appliance.location) {
      throw new Error('Appliance has no location');
    }

    return appliance.location.$attr.id;
  }

  async getRules() {
    return this._call({
      method: 'get',
      path: '/core/rules',
    }).then(result => result.rules.rule);
  }

  /*
   * Bridge API helper
   */

  async _call({
    password = this.password,
    method = 'get',
    path = '/',
    body,
    xml,
  }) {
    if (!password) {
      throw new Error('Missing Password');
    }

    const url = `http://${this._address}${path}`;
    const opts = {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`smile:${password}`).toString('base64')}`,
      },
    };

    if (body) {
      opts.body = body;
    }

    if (xml) {
      opts.body = xml;
      opts.headers['Content-Type'] = 'application/xml';
    }

    const res = await fetch(url, opts);
    if (res.status === 202 || res.status === 204) return;

    const bodyText = await res.text();
    const bodyXML = xmlParser.parse(bodyText, {
      textNodeName: '$text',
      attrNodeName: '$attr',
      attributeNamePrefix: '',
      ignoreAttributes: false,
    });

    if (!res.ok) {
      const err = new Error((bodyXML && bodyXML.error && (bodyXML.error.message || bodyXML.error['reason-phrase'])) || `Unkown Plugwise Error (${res.status})`);
      err.code = res.status;
      throw err;
    }

    return bodyXML;
  }

};
