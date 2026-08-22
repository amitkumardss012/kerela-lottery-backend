import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { prisma } from "../../config";

export class PDFService {
  private static getTemplatePath(): string {
    // Possible locations of the ticket-tempelete.pdf
    const candidates = [
      path.join(__dirname, "../../assets/templates/ticket-tempelete.pdf"),
      path.join(process.cwd(), "src/assets/templates/ticket-tempelete.pdf"),
      path.join(process.cwd(), "public/assets/templates/ticket-tempelete.pdf"),
      path.join(process.cwd(), "../client/public/ticket-tempelete.pdf"),
      path.join(__dirname, "../../../../client/public/ticket-tempelete.pdf"),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    throw new Error(
      `Ticket PDF template not found. Checked: ${candidates.join(", ")}`
    );
  }

  public static async generateTicketPDF(buyerId: number): Promise<Buffer> {
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
      throw new Error(`Buyer with ID ${buyerId} not found`);
    }

    // Collect all ticket numbers (remove duplicates, preserve order)
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

    // Fallback if no tickets generated yet
    if (ticketNumbers.length === 0) {
      ticketNumbers.push(`KL-${buyer.id}-T1`);
    }

    const templatePath = this.getTemplatePath();
    const templateBytes = new Uint8Array(fs.readFileSync(templatePath));
    const templateDoc = await PDFDocument.load(templateBytes);

    const outputDoc = await PDFDocument.create();
    const fontBold = await outputDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await outputDoc.embedFont(StandardFonts.Helvetica);

    const lotteryName = buyer.lottery?.name || "Kerala State Mega Lottery";
    const resultDate = buyer.lottery?.result_date || "Announced on Website";
    const resultTime = buyer.lottery?.result_time || "03:00 PM";
    const packagePrice = buyer.ticketpackage?.price ? buyer.ticketpackage.price.toFixed(2) : "0.00";
    const ticketQty = ticketNumbers.length;

    const ticketPagesCount = Math.ceil(ticketNumbers.length / 2);
    const totalPages = 1 + ticketPagesCount;

    // ----------------------------------------------------
    // PAGE 1: RECEIPT & SUMMARY PAGE
    // ----------------------------------------------------
    const [page1Template] = await outputDoc.copyPages(templateDoc, [0]);
    const page1 = outputDoc.addPage(page1Template);

    // 1. Cover template placeholders with crisp white overlay
    // Table row (Lottery, Price, Qty, Amount):
    page1.drawRectangle({
      x: 50,
      y: 605,
      width: 480,
      height: 25,
      color: rgb(1, 1, 1),
    });

    // Numbers summary line:
    page1.drawRectangle({
      x: 135,
      y: 588,
      width: 395,
      height: 16,
      color: rgb(1, 1, 1),
    });

    // Total paid amount:
    page1.drawRectangle({
      x: 460,
      y: 545,
      width: 80,
      height: 20,
      color: rgb(1, 1, 1),
    });

    // Draw schedule area:
    page1.drawRectangle({
      x: 50,
      y: 430,
      width: 480,
      height: 65,
      color: rgb(1, 1, 1),
    });

    // Registered holder fields:
    page1.drawRectangle({
      x: 135,
      y: 300,
      width: 385,
      height: 85,
      color: rgb(1, 1, 1),
    });

    // Page number footer:
    page1.drawRectangle({
      x: 470,
      y: 20,
      width: 90,
      height: 18,
      color: rgb(1, 1, 1),
    });

    // 2. Render dynamic buyer values on Page 1
    // Purchase detail row:
    page1.drawText(lotteryName, {
      x: 55,
      y: 615,
      size: 9.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page1.drawText(`Rs. ${packagePrice}`, {
      x: 270,
      y: 615,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });

    page1.drawText(`${ticketQty}`, {
      x: 370,
      y: 615,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });

    page1.drawText(`Rs. ${packagePrice}`, {
      x: 475,
      y: 615,
      size: 9.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Numbers summary:
    const ticketSummaryText =
      ticketNumbers.length <= 10
        ? ticketNumbers.join(", ")
        : `${ticketNumbers.slice(0, 10).join(", ")} + ${ticketNumbers.length - 10} more`;

    page1.drawText(ticketSummaryText, {
      x: 140,
      y: 591,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });

    // Total paid:
    page1.drawText(`Rs. ${packagePrice}`, {
      x: 475,
      y: 550,
      size: 10.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Draw schedule:
    page1.drawText(lotteryName, {
      x: 95,
      y: 476,
      size: 9.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page1.drawText("Draw date & time:", {
      x: 95,
      y: 458,
      size: 9,
      font: fontRegular,
      color: rgb(0.35, 0.35, 0.35),
    });

    page1.drawText(`${resultDate} | ${resultTime}`, {
      x: 195,
      y: 458,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page1.drawText("Top prize:", {
      x: 95,
      y: 442,
      size: 9,
      font: fontRegular,
      color: rgb(0.35, 0.35, 0.35),
    });

    page1.drawText("Rs. 25 Crore", {
      x: 155,
      y: 442,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.5, 0.2),
    });

    // Registered holder details:
    page1.drawText(buyer.name, {
      x: 140,
      y: 366,
      size: 9.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page1.drawText(buyer.email, {
      x: 140,
      y: 348,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    page1.drawText(buyer.phone, {
      x: 140,
      y: 330,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    page1.drawText(buyer.state, {
      x: 140,
      y: 312,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Page 1 footer:
    page1.drawText(`Page No 1 of ${totalPages}`, {
      x: 485,
      y: 28,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    // ----------------------------------------------------
    // PAGES 2 TO N: TICKET VOUCHERS (2 TICKETS PER PAGE)
    // ----------------------------------------------------
    // Generate QR Code with link: https://keralastatemegajackpot.com/buyer/:id
    const qrUrl = `https://keralastatemegajackpot.com/buyer/${buyer.id}`;
    const qrPngBuffer = await QRCode.toBuffer(qrUrl, {
      type: "png",
      width: 300,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    const embeddedQrImage = await outputDoc.embedPng(new Uint8Array(qrPngBuffer));

    // Embed Page 2 of template as a reusable voucher
    const [embeddedTicketPage] = await outputDoc.embedPages([templateDoc.getPage(1)]);

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
        color: rgb(0.05, 0.05, 0.05),
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
          color: rgb(1, 1, 1),
        });

        ticketPage.drawRectangle({
          x: 480,
          y: 460 + y2,
          width: 60,
          height: 35,
          color: rgb(1, 1, 1),
        });

        // Draw Ticket 2 Number centered below orange badge
        const t2Width = fontBold.widthOfTextAtSize(ticket2, 11);
        ticketPage.drawText(ticket2, {
          x: cardCenterX - t2Width / 2,
          y: 632 + y2,
          size: 11,
          font: fontBold,
          color: rgb(0.05, 0.05, 0.05),
        });

        // Draw Ticket 2 Dynamic QR Code inside the light grey rounded box
        ticketPage.drawImage(embeddedQrImage, {
          x: 446,
          y: 552 + y2,
          width: 64,
          height: 64,
        });
      } else {
        // If single ticket on final page, ensure clean bottom margin
        ticketPage.drawRectangle({
          x: 30,
          y: 10,
          width: 535,
          height: 40,
          color: rgb(1, 1, 1),
        });
      }

      // Clean bottom footer for this ticket page
      ticketPage.drawText("Modernization & IT Software Division : Department of State Lotteries", {
        x: 180,
        y: 28,
        size: 8,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });

      ticketPage.drawText(`Page No ${pageNum} of ${totalPages}`, {
        x: 485,
        y: 28,
        size: 8,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    const pdfBytes = await outputDoc.save();
    return Buffer.from(pdfBytes);
  }
}

export default PDFService;
