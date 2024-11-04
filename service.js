const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'WSSClientService',
  description: 'WebSocket client for connecting to proxy.wynd.network',
  script: path.join(__dirname, 'index.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

svc.on('install', () => {
  console.log('Service installed successfully');
  svc.start();
});

svc.install();
