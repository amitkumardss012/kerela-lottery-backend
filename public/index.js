"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const PORT = process.env.PORT || 4000;
const server = app_1.default.listen(config_1.ENV.PORT, () => {
    console.log(`
        🖥️  SERVER STARTED 🚀  
        ┌───────────────────┐
        │   [■■■■■■■■■■■]   │
        │   [■■■■■■■■■■■]   │
        │   [■■■■■■■■■■■]   │
        │   [■■■■■■■■■■■]   │ 
        │   [■■■■■■■■■■■]   │
        └───────────────────┘
        http://localhost:${config_1.ENV.PORT}
      `);
});
const shutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`\n🛑 Received ${signal}. Closing server gracefully...`);
    // Close the server
    server.close(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log("🛑 server closed.");
        // Disconnect from the database
        try {
            yield config_1.prisma.$disconnect();
            console.log("✅ Database connection closed.");
        }
        catch (error) {
            console.error("❌ Error disconnecting from database:", error);
        }
        process.exit(0);
    }));
});
// Handle termination signals
["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => shutdown(signal));
});
// Handle unexpected errors
process.on("uncaughtException", (err) => {
    console.error("🔥 Uncaught Exception:", err);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ Unhandled Rejection at:", promise, "reason: ", reason);
});
