# node-bt-smart-hub-devices
Gets a list of devices from the BT SmartHub

## Usage
This module only exposes one method, `getList`. `getList` accepts the IP address of the router as it's only argument and then returns a promise. This promise is then resolved to an array of objects containing data about the devices listed by the BT SmartHub.

The object contains the following:

* `hostname` - The hostname of the device.
* `macAddress` - The MAC address of the device.
* `ip` - The current IP of the device.
* `active` - Whether or not the device is currently connected.

## Example
```
'use strict';
const deviceLister = require('bt-smart-hub-devices');

deviceLister.getList('192.168.1.254').then((devices) => {
    console.log(devices);
});
```
