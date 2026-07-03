import "dotenv/config";
import mysql from "mysql2/promise";

import express from "express";
import http from "http";
import { Server } from "socket.io";

import db from "./config/database.js";

import User from "./models/User.js";
import Event from "./models/Event.js";
import Organization from "./models/Organization.js";
import Room from "./models/Room.js";
import Attendee from "./models/Attendee.js";

import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import attendeeRoutes from "./routes/attendeeRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import errorHandler from "./middleware/errorHandler.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log("Client terhubung");

    socket.on("disconnect", () => {
        console.log("Client keluar");
    });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/events", eventRoutes);
app.use("/users", userRoutes);
app.use("/organizations", organizationRoutes);
app.use("/rooms", roomRoutes);
app.use("/attendees", attendeeRoutes);
app.use("/auth", authRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan"
    });
});

app.use(errorHandler);

Organization.hasMany(Event, { foreignKey: "organizationId" });
Event.belongsTo(Organization, { foreignKey: "organizationId" });

Room.hasMany(Event, { foreignKey: "roomId" });
Event.belongsTo(Room, { foreignKey: "roomId" });

Event.hasMany(Attendee, { foreignKey: "eventId" });
Attendee.belongsTo(Event, { foreignKey: "eventId" });

const PORT = process.env.PORT || 3000;

const initializeApp = async () => {
    try {
        await db.authenticate();
        console.log("Koneksi ke MySQL berhasil!");

        await db.authenticate();
        console.log("Koneksi ke MySQL berhasil!");

        app.get("/", (req, res) => {
            res.send("Server Eventify Berjalan dengan Baik!");
        });

        server.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Gagal konek database:", error);
    }
};

initializeApp();