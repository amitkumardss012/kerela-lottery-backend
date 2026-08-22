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
exports.PDFService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const qrcode_1 = __importDefault(require("qrcode"));
const config_1 = require("../../config");
class PDFService {
    static getTemplatePath() {
        // Possible locations of the ticket-tempelete.pdf
        const candidates = [
            path_1.default.join(__dirname, "../../assets/templates/ticket-tempelete.pdf"),
            path_1.default.join(process.cwd(), "src/assets/templates/ticket-tempelete.pdf"),
            path_1.default.join(process.cwd(), "public/assets/templates/ticket-tempelete.pdf"),
            path_1.default.join(process.cwd(), "../client/public/ticket-tempelete.pdf"),
            path_1.default.join(__dirname, "../../../../client/public/ticket-tempelete.pdf"),
        ];
        for (const p of candidates) {
            if (fs_1.default.existsSync(p)) {
                return p;
            }
        }
        throw new Error(`Ticket PDF template not found. Checked: ${candidates.join(", ")}`);
    }
    static generateTicketPDF(buyerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
            // Collect all ticket numbers (remove duplicates, preserve order)
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
            // Fallback if no tickets generated yet
            if (ticketNumbers.length === 0) {
                ticketNumbers.push(`KL-${buyer.id}-T1`);
            }
            const templatePath = this.getTemplatePath();
            const templateBytes = fs_1.default.readFileSync(templatePath);
            const templateDoc = yield pdf_lib_1.PDFDocument.load(templateBytes);
            const outputDoc = yield pdf_lib_1.PDFDocument.create();
            const fontBold = yield outputDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            const fontRegular = yield outputDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const lotteryName = ((_a = buyer.lottery) === null || _a === void 0 ? void 0 : _a.name) || "Kerala State Mega Lottery";
            const resultDate = ((_b = buyer.lottery) === null || _b === void 0 ? void 0 : _b.result_date) || "Announced on Website";
            const resultTime = ((_c = buyer.lottery) === null || _c === void 0 ? void 0 : _c.result_time) || "03:00 PM";
            const packagePrice = ((_d = buyer.ticketpackage) === null || _d === void 0 ? void 0 : _d.price) ? buyer.ticketpackage.price.toFixed(2) : "0.00";
            const ticketQty = ticketNumbers.length;
            const ticketPagesCount = Math.ceil(ticketNumbers.length / 2);
            const totalPages = 1 + ticketPagesCount;
            // ----------------------------------------------------
            // PAGE 1: RECEIPT & SUMMARY PAGE
            // ----------------------------------------------------
            const [page1Template] = yield outputDoc.copyPages(templateDoc, [0]);
            const page1 = outputDoc.addPage(page1Template);
            // 1. Cover template placeholders with crisp white overlay
            // Table row (Lottery, Price, Qty, Amount):
            page1.drawRectangle({
                x: 50,
                y: 605,
                width: 480,
                height: 25,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
            });
            // Numbers summary line:
            page1.drawRectangle({
                x: 135,
                y: 588,
                width: 395,
                height: 16,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
            });
            // Total paid amount:
            page1.drawRectangle({
                x: 460,
                y: 545,
                width: 80,
                height: 20,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
            });
            // Draw schedule area:
            page1.drawRectangle({
                x: 50,
                y: 430,
                width: 480,
                height: 65,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
            });
            // Registered holder fields:
            page1.drawRectangle({
                x: 135,
                y: 300,
                width: 385,
                height: 85,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
            });
            // Page number footer:
            page1.drawRectangle({
                x: 470,
                y: 20,
                width: 90,
                height: 18,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
            });
            // 2. Render dynamic buyer values on Page 1
            // Purchase detail row:
            page1.drawText(lotteryName, {
                x: 55,
                y: 615,
                size: 9.5,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
            });
            page1.drawText(`Rs. ${packagePrice}`, {
                x: 270,
                y: 615,
                size: 9.5,
                font: fontRegular,
                color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
            });
            page1.drawText(`${ticketQty}`, {
                x: 370,
                y: 615,
                size: 9.5,
                font: fontRegular,
                color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
            });
            page1.drawText(`Rs. ${packagePrice}`, {
                x: 475,
                y: 615,
                size: 9.5,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
            });
            // Numbers summary:
            const ticketSummaryText = ticketNumbers.length <= 10
                ? ticketNumbers.join(", ")
                : `${ticketNumbers.slice(0, 10).join(", ")} + ${ticketNumbers.length - 10} more`;
            page1.drawText(ticketSummaryText, {
                x: 140,
                y: 591,
                size: 8.5,
                font: fontRegular,
                color: (0, pdf_lib_1.rgb)(0.25, 0.25, 0.25),
            });
            // Total paid:
            page1.drawText(`Rs. ${packagePrice}`, {
                x: 475,
                y: 550,
                size: 10.5,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
            });
            // Draw schedule:
            page1.drawText(lotteryName, {
                x: 95,
                y: 476,
                size: 9.5,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
            });
            page1.drawText("Draw date & time:", {
                x: 95,
                y: 458,
                size: 9,
                font: fontRegular,
                color: (0, pdf_lib_1.rgb)(0.35, 0.35, 0.35),
            });
            page1.drawText(`${resultDate} | ${resultTime}`, {
                x: 195,
                y: 458,
                size: 9,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
            });
            page1.drawText("Top prize:", {
                x: 95,
                y: 442,
                size: 9,
                font: fontRegular,
                color: (0, pdf_lib_1.rgb)(0.35, 0.35, 0.35),
            });
            page1.drawText("Rs. 25 Crore", {
                x: 155,
                y: 442,
                size: 9,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(0.1, 0.5, 0.2),
            });
            // Registered holder details:
            page1.drawText(buyer.name, {
                x: 140,
                y: 366,
                size: 9.5,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
            });
            page1.drawText(buyer.email, {
                x: 140,
                y: 348,
                size: 9,
                font: fontRegular,
                color: (0, pdf_lib_1.rgb)(0.2, 0.2, 0.2),
            });
            page1.drawText(buyer.phone, {
                x: 140,
                y: 330,
                size: 9,
                font: fontRegular,
                color: (0, pdf_lib_1.rgb)(0.2, 0.2, 0.2),
            });
            page1.drawText(buyer.state, {
                x: 140,
                y: 312,
                size: 9,
                font: fontRegular,
                color: (0, pdf_lib_1.rgb)(0.2, 0.2, 0.2),
            });
            // Page 1 footer:
            page1.drawText(`Page No 1 of ${totalPages}`, {
                x: 485,
                y: 28,
                size: 8,
                font: fontRegular,
                color: (0, pdf_lib_1.rgb)(0.4, 0.4, 0.4),
            });
            // ----------------------------------------------------
            // PAGES 2 TO N: TICKET VOUCHERS (2 TICKETS PER PAGE)
            // ----------------------------------------------------
            // Generate QR Code with link: https://keralastatemegajackpot.com/buyer/:id
            const qrUrl = `https://keralastatemegajackpot.com/buyer/${buyer.id}`;
            const qrPngBuffer = yield qrcode_1.default.toBuffer(qrUrl, {
                type: "png",
                width: 300,
                margin: 1,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            });
            const embeddedQrImage = yield outputDoc.embedPng(qrPngBuffer);
            // Embed Page 2 of template as a reusable voucher
            const [embeddedTicketPage] = yield outputDoc.embedPages([templateDoc.getPage(1)]);
            for (let p = 0; p < ticketPagesCount; p++) {
                const pageNum = p + 2;
                const ticketIndex1 = p * 2;
                const ticketIndex2 = p * 2 + 1;
                const ticket1 = ticketNumbers[ticketIndex1];
                const ticket2 = ticketIndex2 < ticketNumbers.length ? ticketNumbers[ticketIndex2] : null;
                const ticketPage = outputDoc.addPage([595.5, 842.25]);
                // --- TICKET 1 (TOP VOUCHER) ---
                const y1 = 55;
                ticketPage.drawPage(embeddedTicketPage, {
                    x: 0,
                    y: y1,
                    xScale: 1,
                    yScale: 1,
                });
                // Draw Ticket 1 Number centered below orange "TICKET NUMBER" badge
                const cardCenterX = 478;
                const t1Width = fontBold.widthOfTextAtSize(ticket1, 11);
                ticketPage.drawText(ticket1, {
                    x: cardCenterX - t1Width / 2,
                    y: 632 + y1,
                    size: 11,
                    font: fontBold,
                    color: (0, pdf_lib_1.rgb)(0.05, 0.05, 0.05),
                });
                // Draw Ticket 1 Dynamic QR Code inside the light grey rounded box
                ticketPage.drawImage(embeddedQrImage, {
                    x: 446,
                    y: 552 + y1,
                    width: 64,
                    height: 64,
                });
                // --- TICKET 2 (BOTTOM VOUCHER) ---
                if (ticket2) {
                    const y2 = -285;
                    ticketPage.drawPage(embeddedTicketPage, {
                        x: 0,
                        y: y2,
                        xScale: 1,
                        yScale: 1,
                    });
                    // Cover duplicate footer from bottom voucher
                    ticketPage.drawRectangle({
                        x: 30,
                        y: 10,
                        width: 535,
                        height: 40,
                        color: (0, pdf_lib_1.rgb)(1, 1, 1),
                    });
                    ticketPage.drawRectangle({
                        x: 480,
                        y: 460 + y2,
                        width: 60,
                        height: 35,
                        color: (0, pdf_lib_1.rgb)(1, 1, 1),
                    });
                    // Draw Ticket 2 Number centered below orange badge
                    const t2Width = fontBold.widthOfTextAtSize(ticket2, 11);
                    ticketPage.drawText(ticket2, {
                        x: cardCenterX - t2Width / 2,
                        y: 632 + y2,
                        size: 11,
                        font: fontBold,
                        color: (0, pdf_lib_1.rgb)(0.05, 0.05, 0.05),
                    });
                    // Draw Ticket 2 Dynamic QR Code inside the light grey rounded box
                    ticketPage.drawImage(embeddedQrImage, {
                        x: 446,
                        y: 552 + y2,
                        width: 64,
                        height: 64,
                    });
                }
                else {
                    // If single ticket on final page, ensure clean bottom margin
                    ticketPage.drawRectangle({
                        x: 30,
                        y: 10,
                        width: 535,
                        height: 40,
                        color: (0, pdf_lib_1.rgb)(1, 1, 1),
                    });
                }
                // Clean bottom footer for this ticket page
                ticketPage.drawText("Modernization & IT Software Division : Department of State Lotteries", {
                    x: 180,
                    y: 28,
                    size: 8,
                    font: fontRegular,
                    color: (0, pdf_lib_1.rgb)(0.4, 0.4, 0.4),
                });
                ticketPage.drawText(`Page No ${pageNum} of ${totalPages}`, {
                    x: 485,
                    y: 28,
                    size: 8,
                    font: fontRegular,
                    color: (0, pdf_lib_1.rgb)(0.4, 0.4, 0.4),
                });
            }
            const pdfBytes = yield outputDoc.save();
            return Buffer.from(pdfBytes);
        });
    }
}
exports.PDFService = PDFService;
exports.default = PDFService;
