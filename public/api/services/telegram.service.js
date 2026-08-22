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
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../config");
class TelegramService {
    /**
     * Sends real-time purchase notification to Telegram channel/group
     * @param buyerId Buyer database ID
     */
    static sendPurchaseNotification(buyerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!buyerId || isNaN(buyerId)) {
                console.warn("[TelegramService] Invalid buyer ID provided for notification");
                return;
            }
            const botToken = config_1.ENV.telegram_bot_token;
            const chatId = config_1.ENV.telegram_chat_id;
            if (!botToken || !chatId) {
                console.warn("[TelegramService] Telegram Bot Token or Chat ID is not configured in ENV");
                return;
            }
            try {
                const buyer = yield config_1.prisma.buyer.findUnique({
                    where: { id: buyerId },
                    include: {
                        lottery: true,
                        ticketpackage: true,
                        ticket: {
                            where: { buyer_id: buyerId },
                        },
                        package_ticket: {
                            where: { buyer_id: buyerId },
                        },
                    },
                });
                if (!buyer) {
                    console.warn(`[TelegramService] Buyer #${buyerId} not found in database`);
                    return;
                }
                // Collect all ticket numbers
                const ticketNumbersSet = new Set();
                if (Array.isArray(buyer.ticket)) {
                    buyer.ticket.forEach((t) => {
                        if (t.ticket_number)
                            ticketNumbersSet.add(t.ticket_number.trim().toUpperCase());
                    });
                }
                if (Array.isArray(buyer.package_ticket)) {
                    buyer.package_ticket.forEach((pt) => {
                        if (pt.ticket_number)
                            ticketNumbersSet.add(pt.ticket_number.trim().toUpperCase());
                    });
                }
                const ticketNumbers = Array.from(ticketNumbersSet);
                const lotteryName = ((_a = buyer.lottery) === null || _a === void 0 ? void 0 : _a.name) || "Kerala State Mega Lottery";
                const packageName = ((_b = buyer.ticketpackage) === null || _b === void 0 ? void 0 : _b.name) || "Standard Package";
                const packagePrice = ((_c = buyer.ticketpackage) === null || _c === void 0 ? void 0 : _c.price) ? `₹${buyer.ticketpackage.price}` : "N/A";
                const transactionId = buyer.transaction_id || "N/A";
                const purchaseDate = buyer.createdAt
                    ? new Date(buyer.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    : new Date().toLocaleString("en-IN");
                // Format ticket numbers list
                const formattedTickets = ticketNumbers.length > 0
                    ? ticketNumbers.map((t) => `<code>${t}</code>`).join(", ")
                    : "<i>No specific tickets generated</i>";
                const message = `🎉 <b>NEW LOTTERY PURCHASE RECEIVED!</b> 🎟️
━━━━━━━━━━━━━━━━━━━━
👤 <b>Customer Details:</b>
• <b>Name:</b> ${buyer.name}
• <b>Phone:</b> ${buyer.phone}
• <b>Email:</b> ${buyer.email || "N/A"}
• <b>State:</b> ${buyer.state}

📦 <b>Order Summary:</b>
• <b>Lottery:</b> ${lotteryName}
• <b>Package:</b> ${packageName} (${packagePrice})
• <b>Transaction ID:</b> <code>${transactionId}</code>
• <b>Purchase Time:</b> ${purchaseDate}

🎟️ <b>Tickets Purchased (${ticketNumbers.length}):</b>
${formattedTickets}
━━━━━━━━━━━━━━━━━━━━
<i>Verify this transaction in Admin Panel to dispatch confirmation email.</i>`;
                const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
                const response = yield fetch(telegramUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: "HTML",
                    }),
                });
                const data = yield response.json();
                if (!response.ok || !data.ok) {
                    console.error("[TelegramService] Telegram API responded with error:", data);
                }
                else {
                    console.log(`[TelegramService] Purchase notification sent for Buyer #${buyer.id} (msg_id: ${(_d = data.result) === null || _d === void 0 ? void 0 : _d.message_id})`);
                }
            }
            catch (err) {
                console.error("[TelegramService] Failed to send Telegram purchase notification:", err);
            }
        });
    }
}
exports.default = TelegramService;
