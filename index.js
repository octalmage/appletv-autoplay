#! /usr/bin/env node
const { scan, parseCredentials, NowPlayingInfo } = require('node-appletv');
const inquirer = require('inquirer');
const Preferences = require('preferences');
const util = require('util');

const prefs = new Preferences('com.octalmage.applev-autoplay', { devices: {} }, {
  encrypt: false,
  format: 'json'
});

const args = process.argv.slice(2);

return new Promise((resolve, reject) => {
  if (args.length > 0 && typeof prefs.devices[args[0]] !== 'undefined') {
    return scan(args[0])
    .then(devices => {
      // Short circuit to actual connection.
      return reject(devices[0]);
    });
  }

  return resolve(scan());
})
.then(devices => {
  // TODO: Add an error for no devices.
  if (devices.length === 0) {
    throw new Error('No Apple TVs found')
  } else if (devices.length === 1) {
    return devices[0];
  }
  return inquirer.prompt([{
    type: 'list',
    name: 'device',
    message: 'Which Apple TV would you like to pair with?',
    choices: devices.map(device => {
      return {
        name: device.name + " (" + device.address + ":" + device.port + ")",
        value: device.uid
      };
    })
  }])
  .then((answers) => {
    let uid = answers['device'];
    return devices.filter(device => { return device.uid == uid; })[0];
  })
})
.then((device) => {
  if (typeof prefs.devices[device.uid] !== 'undefined') {
    console.log('Already paired!')
    return device;
  }

  return device.openConnection()
  .then(device => {
    return device.pair();
  })
  .then((callback) => {
    return inquirer.prompt({
      type: 'input',
      name: 'pin',
      message: 'Pin code?',
    })
    .then((answer) => {
      return callback(answer.pin)
    });
  })
  .then(device => {
    // you're paired!
    let credentials = device.credentials.toString();

    prefs.devices[device.uid] = { credentials: device.credentials.toString() };
    prefs.save();
    device.closeConnection();
    return device;
  })
})
// For short circuiting.
.catch(device => device)
.then((device) => {
  if (device instanceof Error) {
    throw device;
  }
  const creds = prefs.devices[device.uid].credentials;
  const uniqueIdentifier = creds.split(':')[0];
  return scan(uniqueIdentifier)
  .then(devices => {
    const device = devices[0];
    return device.openConnection(parseCredentials(creds));
  });
})
.then((device) => {
  console.log('Connected!')
  let paused = false;
  let timer;
  device.on('nowPlaying', (info) => {
    console.log(info.toString())
    if (typeof info.playbackState === 'undefined') {
      return;
    }

    switch(info.playbackState) {
      case 'paused':
        clearTimeout(timer);
        paused = true;
        timer = setTimeout(() => {
          if (paused === true) {
            console.log('Paused, pressing play');
            device.sendKeyCommand(10);
          }
        }, 5000);
        break;
      case 'playing':
        clearTimeout(timer);
        paused = false;
        break;
    }
  });
})
.catch(error => {
  console.log(error.toString());
});
