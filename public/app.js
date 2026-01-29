"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const middlewares_1 = require("./api/middlewares");
const config_1 = require("./config");
const types_1 = require("./api/types/types");
const path_1 = __importDefault(require("path"));
// 📦 Importing Routes
const routes_1 = require("./api/routes");
const webConfig_routes_1 = __importDefault(require("./api/routes/webConfig.routes"));
// 🚀 Initialize express application
const app = (0, express_1.default)();
// 🛡️ Security and utility middlewares
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({
    origin: [config_1.ENV.FRONTEND_URL, config_1.ENV.FRONTEND_URL1],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use((0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, //⌛ 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
}));
// 🩺 Health check endpoint
app.get("/", (_, res) => {
    res.send("Hello World");
});
// 🧭 API routes configuration
app.use("/api/v1/admin", routes_1.AdminRoute);
app.use("/api/v1/lottery", routes_1.LotteryRoute);
app.use("/api/v1/ticket-package", routes_1.TicketPackageRoute);
app.use("/api/v1/winner", routes_1.WinnerRoute);
app.use("/api/v1/enquiry", routes_1.EnquiryRoute);
app.use("/api/v1/buyer", routes_1.BuyerRoute);
app.use("/api/v1/stats", routes_1.StatsRoute);
app.use("/api/v1/qr", routes_1.QrRoute);
app.use("/api/v1/web-config", webConfig_routes_1.default);
app.use("/api/v1/blog", routes_1.BlogRoute);
// ⛔ 404 route handler
app.all("*", (_, res) => {
    res.status(types_1.statusCode.Bad_Request).json({
        success: false,
        message: "Route not found",
    });
});
// ⚠️ Global error handling middleware
app.use(middlewares_1.errorMiddleware);
// 📤 Export the configured app
exports.default = app;
