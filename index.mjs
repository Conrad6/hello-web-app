import http from 'http';
import ws from 'ws';

const serverPort = parseInt(process.env.SERVER_PORT || '80');
const maxUsers = process.env.MAX_USERS ? parseInt(process.env.MAX_USERS) : Number.POSITIVE_INFINITY;
const loadBalancerHost = new URL(process.env.LOAD_BALANCER_HOST);
const containerName = process.env.CONTAINER_NAME;

let currentLoad = 0;
let loadBalancerSocket;

const server = http.createServer().listen(serverPort, () => {
    console.log(new Date().toISOString(), `Server started on port: ${serverPort}`);
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
        
        socket.on('message')
    }
})