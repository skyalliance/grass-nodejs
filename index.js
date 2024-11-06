const WebSocket = require('ws');
const https = require('https');
const uuid = require('uuid');
const { log } = require('console');

const userId = '2oA93d4cy1LJn6T400TkOVbSVMo';

async function connectToWss(userId) {
    const deviceId = uuid.v4();
    log(`Device ID: ${deviceId}`);
    
    const sslAgent = new https.Agent({
        rejectUnauthorized: false
    });

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    };

    const uri = "wss://proxy.wynd.network:4650/";
    const websocket = new WebSocket(uri, { headers, agent: sslAgent });

    websocket.on('open', () => {
        log('WebSocket connection opened.');

        const sendPing = () => {
            const sendMessage = JSON.stringify({
                id: uuid.v4(),
                version: "1.0.0",
                action: "PING",
                data: {}
            });
            log(`Sending Ping: ${sendMessage}`);
            websocket.send(sendMessage);
        };
        
        setInterval(sendPing, 20000);
    });

    websocket.on('message', (data) => {
        const message = JSON.parse(data);
        log('Received:', message);

        if (message.action === 'AUTH') {
            const authResponse = {
                id: message.id,
                origin_action: "AUTH",
                result: {
                    browser_id: deviceId,
                    user_id: userId,
                    user_agent: headers['User-Agent'],
                    timestamp: Math.floor(Date.now() / 1000),
                    device_type: "extension",
                    version: "2.5.0"
                }
            };
            log('Sending Auth Response:', authResponse);
            websocket.send(JSON.stringify(authResponse));
        } else if (message.action === 'PONG') {
            const pongResponse = {
                id: message.id,
                origin_action: "PONG"
            };
            log('Sending Pong Response:', pongResponse);
            websocket.send(JSON.stringify(pongResponse));
        }
    });

    websocket.on('error', (err) => {
        console.error('WebSocket error:', err);
    });

    websocket.on('close', () => {
        log('WebSocket connection closed. Reconnecting...');
        setTimeout(() => connectToWss(userId), Math.random() * 9000 + 1000);
    });
}

connectToWss(userId);
