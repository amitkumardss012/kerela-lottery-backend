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
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../config");
class EmailService {
    static getTransporter() {
        return nodemailer_1.default.createTransport({
            host: config_1.ENV.smtp_host,
            port: Number(config_1.ENV.smtp_port) || 587,
            secure: Number(config_1.ENV.smtp_port) === 465,
            auth: {
                user: config_1.ENV.smtp_user,
                pass: config_1.ENV.smtp_pass,
            },
        });
    }
    static sendTicketDetailsEmail(buyerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!buyerId || isNaN(buyerId)) {
                throw new Error("Invalid buyer ID for sending email");
            }
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
                throw new Error(`Buyer with ID ${buyerId} not found`);
            }
            if (!buyer.email) {
                throw new Error(`Buyer with ID ${buyerId} does not have an email address`);
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
            const transporter = this.getTransporter();
            // Render ticket pills HTML
            const ticketPillsHtml = ticketNumbers.length > 0
                ? ticketNumbers
                    .map((num) => `
          <div style="display: inline-block; margin: 4px; padding: 8px 14px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: bold; color: #92400e; letter-spacing: 1px;">
            ${num}
          </div>`)
                    .join("")
                : `<p style="color: #64748b; font-style: italic; font-size: 14px;">No specific ticket numbers found.</p>`;
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kerala State Mega Lottery - Ticket Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #047857 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                MEGA KERALA LOTTERY
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #fde68a; font-weight: 600;">
                Official Ticket Confirmation & Purchase Receipt
              </p>
            </td>
          </tr>

          <!-- Main Greeting -->
          <tr>
            <td style="padding: 24px 28px 12px 28px;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">
                Hello, <span style="color: #047857;">${buyer.name}</span>!
              </h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for participating in the <strong>${lotteryName}</strong>. Your ticket purchase has been verified and confirmed successfully.
              </p>
            </td>
          </tr>

          <!-- Ticket Numbers Box -->
          <tr>
            <td style="padding: 12px 28px;">
              <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 18px 16px; text-align: center;">
                <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                  🎟️ YOUR PURCHASED TICKET NUMBER(S) [${ticketNumbers.length}]
                </div>
                <div style="text-align: center;">
                  ${ticketPillsHtml}
                </div>
              </div>
            </td>
          </tr>

          <!-- Purchase Details Table -->
          <tr>
            <td style="padding: 12px 28px 20px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px;">
                <tr style="background-color: #f8fafc;">
                  <td colspan="2" style="padding: 10px 14px; font-weight: 700; color: #334155; border-bottom: 1px solid #e2e8f0;">
                    📋 Order Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding: 9px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9; width: 40%;">Lottery</td>
                  <td style="padding: 9px 14px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${lotteryName}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Package</td>
                  <td style="padding: 9px 14px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${packageName} (${packagePrice})</td>
                </tr>
                <tr>
                  <td style="padding: 9px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Transaction ID</td>
                  <td style="padding: 9px 14px; font-family: monospace; font-weight: 600; color: #047857; border-bottom: 1px solid #f1f5f9;">${transactionId}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Customer Mobile</td>
                  <td style="padding: 9px 14px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${buyer.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Customer State</td>
                  <td style="padding: 9px 14px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${buyer.state}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 14px; color: #64748b;">Purchase Date</td>
                  <td style="padding: 9px 14px; font-weight: 600; color: #1e293b;">${purchaseDate}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Note & Guidelines -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 12px 14px; font-size: 12px; color: #854d0e; line-height: 1.5;">
                💡 <strong>Important Note:</strong> Keep this confirmation email safe. The official draw results will be announced on our website. Best of luck!
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #cbd5e1; font-weight: 600;">
                Mega Kerala Lottery • Government Directorate of State Lotteries
              </p>
              <p style="margin: 0;">
                Vikas Bhavan P.O., Thampanoor, Thiruvananthapuram, Kerala<br>
                For support, contact us through our official helpline.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
            const mailOptions = {
                from: config_1.ENV.smtp_from || `"Mega Kerala Lottery" <${config_1.ENV.smtp_user}>`,
                to: buyer.email,
                subject: `🎉 Ticket Details Confirmed - ${lotteryName} (#${buyer.id})`,
                html: htmlContent,
            };
            console.log(`[EmailService] Sending ticket details email to ${buyer.email} for Buyer #${buyer.id}...`);
            const info = yield transporter.sendMail(mailOptions);
            console.log(`[EmailService] Email sent successfully: ${info.messageId}`);
            return {
                success: true,
                messageId: info.messageId,
                recipient: buyer.email,
                ticketCount: ticketNumbers.length,
            };
        });
    }
}
exports.default = EmailService;
