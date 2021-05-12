# Plugwise

This repository serves as inspiration for your own Homey app, to help you understand Homey Apps SDK concepts in a real-life context.

Read the [Homey Apps SDK Documentation](https://apps.developer.homey.app) for more information about developing apps for Homey.

> Because this repository is a clone of the live code, pull requests will be ignored.

## What does this app do?

The Plugwise app connects to a Plugwise Adam, Plugwise Anna or Plugwise Smile (P1 Meter) bridge on the LAN. The app finds these bridges using mDNS-SD Discovery.

The app polls the bridges every few seconds for data, and distributes that data to connected devices.