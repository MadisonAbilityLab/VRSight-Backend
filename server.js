const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    path: '/socket.io/',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    cors: {
        origin: ["https://launch.playcanvas.com", "http://launch.playcanvas.com", "*"],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["content-type", "authorization"],
        credentials: false
    },
    allowEIO3: true,
    transports: ['polling', 'websocket']
});

// Add CORS middleware for Express
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get('/', (req, res) => {
    res.send('Audio server running');
});

// Track connected clients
const connectedClients = new Set();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    connectedClients.add(socket.id);
    console.log(`Total connected clients: ${connectedClients.size}`);

    socket.on('audioNotification', (packet) => {
        console.log('Broadcasting audio from:', socket.id);
        socket.broadcast.emit('audioNotification', {
            ...packet,
            sourceId: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        connectedClients.delete(socket.id);
        console.log(`Total connected clients: ${connectedClients.size}`);
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});