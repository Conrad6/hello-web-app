import http from 'http';
import ws from 'ws';

const serverPort = parseInt(process.env.SERVER_PORT || '80');
const maxUsers = process.env.MAX_USERS ? parseInt(process.env.MAX_USERS) : Number.POSITIVE_INFINITY;
const loadBalancerHost = new URL(process.env.LOAD_BALANCER_HOST);

let currentLoad = 0;

function date() {
    return new Date(Date.parse(new Date().toUTCString())).toISOString();
}

const server = http.createServer().listen(serverPort, () => {
    console.log(date(), `Server started on port: ${serverPort}`);
});

const wss = new ws.WebSocketServer({
    server
});

wss.on('connection', (socket, request) => {
    const hostUrl = new URL(request.headers.host);
    if (hostUrl.host == loadBalancerHost.host) {
        socket.on('ping', () => {
            socket.pong(JSON.stringify({ currentLoad }));
        });
    } else {
        socket.on('message', data => {
            if (!data) return;
            console.log(date(), `Message received: ${data.toString()}`);
        });
    }
})