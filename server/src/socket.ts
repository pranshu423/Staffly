import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

interface JwtPayload {
    id: string;
    role: string;
}

let io: SocketIOServer;
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const initSocket = (server: HttpServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.use((socket, next) => {
        let token = socket.handshake.auth.token;

        if (!token && socket.handshake.headers.cookie) {
            const cookies = parse(socket.handshake.headers.cookie);
            token = cookies.jwt;
        }

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
            socket.data.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.data.user.id;
        // console.log(`User connected: ${userId}`);

        onlineUsers.set(userId, socket.id);
        io.emit('online_users', Array.from(onlineUsers.keys()));

        // Join admin room if admin
        if (socket.data.user.role === 'admin') {
            socket.join('admin_room');
        }

        socket.on('disconnect', () => {
            // console.log(`User disconnected: ${userId}`);
            onlineUsers.delete(userId);
            io.emit('online_users', Array.from(onlineUsers.keys()));
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const getUserSocketId = (userId: string) => {
    return onlineUsers.get(userId);
};
