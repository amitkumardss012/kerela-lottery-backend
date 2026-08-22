import { ENV, prisma } from "../../config";

class TelegramService {
  /**
   * Sends real-time purchase notification to Telegram channel/group
   * @param buyerId Buyer database ID
   */
  public static async sendPurchaseNotification(buyerId: number) {
    if (!buyerId || isNaN(buyerId)) {
      console.warn("[TelegramService] Invalid buyer ID provided for notification");
      return;
    }

    const botToken = ENV.telegram_bot_token;
    const chatId = ENV.telegram_chat_id;

    if (!botToken || !chatId) {
      console.warn("[TelegramService] Telegram Bot Token or Chat ID is not configured in ENV");
      return;
    }

    try {
      const buyer = await prisma.buyer.findUnique({
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
      const ticketNumbersSet = new Set<string>();

      if (Array.isArray(buyer.ticket)) {
        buyer.ticket.forEach((t) => {
          if (t.ticket_number) ticketNumbersSet.add(t.ticket_number.trim().toUpperCase());
        });
      }

      if (Array.isArray(buyer.package_ticket)) {
        buyer.package_ticket.forEach((pt) => {
          if (pt.ticket_number) ticketNumbersSet.add(pt.ticket_number.trim().toUpperCase());
        });
      }

      const ticketNumbers = Array.from(ticketNumbersSet);
      const lotteryName = buyer.lottery?.name || "Kerala State Mega Lottery";
      const packageName = buyer.ticketpackage?.name || "Standard Package";
      const packagePrice = buyer.ticketpackage?.price ? `₹${buyer.ticketpackage.price}` : "N/A";
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
      const formattedTickets =
        ticketNumbers.length > 0
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

      const response = await fetch(telegramUrl, {
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

      const data = await response.json();

      if (!response.ok || !data.ok) {
        console.error("[TelegramService] Telegram API responded with error:", data);
      } else {
        console.log(`[TelegramService] Purchase notification sent for Buyer #${buyer.id} (msg_id: ${data.result?.message_id})`);
      }
    } catch (err) {
      console.error("[TelegramService] Failed to send Telegram purchase notification:", err);
    }
  }
}

export default TelegramService;
