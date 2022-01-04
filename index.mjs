import http from 'http';
import {WebSocketServer} from 'ws';

const serverPort = parseInt(process.env.SERVER_PORT || '80');
const maxUsers = process.env.MAX_USERS ? parseInt(process.env.MAX_USERS) : Number.POSITIVE_INFINITY;
const loadBalancerHost = new URL(process.env.LOAD_BALANCER_HOST);

let currentUserCount = 0;

function date() {
    return new Date(Date.parse(new Date().toUTCString())).toISOString();
}

const server = http.createServer().listen(serverPort, () => {
    console.log(date(), `Server started on port: ${serverPort}`);
});

const wss = new WebSocketServer({
    server
});

let loadBalancerSocket;

wss.on('connection', (socket, request) => {
    if (request.headers.host == loadBalancerHost.host) {
        socket.on('ping', () => {
            socket.pong(JSON.stringify({ currentLoad: currentUserCount }));
        });
        loadBalancerSocket = socket;
    } else {
        if (currentUserCount >= maxUsers) {
            socket.close(1016, `Saturation limit reached`);
            return;
        }
        socket.on('close', code => {
            if (code === 1001) {
                currentUserCount--;
                loadBalancerSocket?.send(JSON.stringify({ action: 'USER_LEFT', currentLoad: currentUserCount }));
            }
        });

        currentUserCount++;
        loadBalancerSocket?.send(JSON.stringify({ action: 'USER_ADDED', currentLoad: currentUserCount }));
        socket.on('message', data => {
            if (!data) return;
            console.log(date(), `Message received: ${data.toString()}`);
        });
    }
})