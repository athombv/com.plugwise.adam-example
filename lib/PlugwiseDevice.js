'use strict';

const Homey = require('homey');

module.exports = class PlugwiseDevice extends Homey.Device {

  onInit(...props) {
    super.onInit(...props);

    this._onPoll = this._onPoll.bind(this);
    this._onAppliancePoll = this._onAppliancePoll.bind(this);
    this._onLocationPoll = this._onLocationPoll.bind(this);

    const {
      bridgeId,
      applianceId,
      locationId,
    } = this.getData();

    this.bridgeId = bridgeId;
    this.applianceId = applianceId || null;
    this.locationId = locationId || null;

    this.log(this.getName(), this.bridgeId, this.applianceId);

    const {
      password,
    } = this.getStore();

    this.setUnavailable(Homey.__('loading'));
    Homey.app.getBridge({ bridgeId })
      .then(bridge => {
        this.bridge = bridge;
        return this.bridge.testPassword({ password });
      })
      .then(result => {
        if (!result) {
          throw new Error('Invalid password');
        }

        this.bridge.password = password;
        this.bridge.enablePolling();
        this.bridge.on('poll', this._onPoll);

        if (this.applianceId) {
          this.bridge.on(`appliance:${applianceId}:poll`, this._onAppliancePoll);
        }

        if (this.locationId) {
          this.bridge.on(`location:${locationId}:poll`, this._onLocationPoll);
        }

        this.setAvailable();
      })
      .catch(err => {
        this.error(err);
        this.setUnavailable(err);
      });
  }

  _onPoll(payload) {
    try {
      this.onPoll({ payload });
    } catch (err) {
      this.error(err);
    }
  }

  _onAppliancePoll(appliance) {
    try {
      this.onPoll({ appliance });
    } catch (err) {
      this.error(err);
    }
  }

  _onLocationPoll(location) {
    try {
      this.onPoll({ location });
    } catch (err) {
      this.error(err);
    }
  }

  onPoll() {
    // Extend me
  }

  onDeleted() {
    if (this.bridge) {
      this.bridge.stopPolling();
      this.bridge.removeListener(`appliance:${this.applianceId}:poll`, this._onAppliancePoll);
    }
  }

};
