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
class PackageTicketService {
    /**
     * Generate random tickets for a ticket package.
     * Capped at max 100 per request as required.
     */
    static generateRandomTickets(ticket_package_id, count) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (count <= 0 || count > 100) {
                throw new Error("Count must be between 1 and 100");
            }
            const ticketPackage = yield config_1.prisma.ticketpackage.findUnique({
                where: { id: ticket_package_id },
            });
            if (!ticketPackage) {
                throw new Error("Ticket package not found");
            }
            const lottery_id = (_a = ticketPackage.lottery_id) !== null && _a !== void 0 ? _a : null;
            // Fetch all existing ticket numbers for this package to prevent duplicates
            const existingPackageTickets = yield config_1.prisma.package_ticket.findMany({
                where: { ticket_package_id },
                select: { ticket_number: true },
            });
            const existingSet = new Set(existingPackageTickets.map((t) => t.ticket_number));
            const generatedTickets = [];
            let attempts = 0;
            const maxAttempts = count * 50;
            while (generatedTickets.length < count && attempts < maxAttempts) {
                attempts++;
                const randomNum = Math.floor(100000 + Math.random() * 900000);
                const ticketNumber = `KL${randomNum}`;
                if (!existingSet.has(ticketNumber)) {
                    existingSet.add(ticketNumber);
                    generatedTickets.push({
                        ticket_package_id,
                        lottery_id,
                        ticket_number: ticketNumber,
                        updatedAt: new Date(),
                    });
                }
            }
            if (generatedTickets.length === 0) {
                throw new Error("Failed to generate unique ticket numbers");
            }
            yield config_1.prisma.package_ticket.createMany({
                data: generatedTickets,
                skipDuplicates: true,
            });
            return generatedTickets;
        });
    }
    /**
     * Manually generate tickets by providing custom ticket numbers.
     */
    static generateManualTickets(ticket_package_id, ticketNumbers) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const ticketPackage = yield config_1.prisma.ticketpackage.findUnique({
                where: { id: ticket_package_id },
            });
            if (!ticketPackage) {
                throw new Error("Ticket package not found");
            }
            const lottery_id = (_a = ticketPackage.lottery_id) !== null && _a !== void 0 ? _a : null;
            // Clean and validate ticket numbers
            const cleanNumbers = Array.from(new Set(ticketNumbers
                .map((t) => t.trim().toUpperCase())
                .filter((t) => t.length >= 3)));
            if (cleanNumbers.length === 0) {
                throw new Error("Please provide at least one valid ticket number");
            }
            // Check existing ticket numbers in DB for this package
            const existing = yield config_1.prisma.package_ticket.findMany({
                where: {
                    ticket_package_id,
                    ticket_number: { in: cleanNumbers },
                },
                select: { ticket_number: true },
            });
            if (existing.length > 0) {
                const duplicates = existing.map((e) => e.ticket_number).join(", ");
                throw new Error(`The following ticket number(s) already exist for this package: ${duplicates}`);
            }
            const ticketsToCreate = cleanNumbers.map((num) => ({
                ticket_package_id,
                lottery_id,
                ticket_number: num,
                updatedAt: new Date(),
            }));
            yield config_1.prisma.package_ticket.createMany({
                data: ticketsToCreate,
                skipDuplicates: true,
            });
            return ticketsToCreate;
        });
    }
    /**
     * Get pre-generated tickets for a package (Admin query with status stats & pagination).
     */
    static getByPackageId(ticket_package_id_1, is_sold_1) {
        return __awaiter(this, arguments, void 0, function* (ticket_package_id, is_sold, page = 1, limit = 100) {
            const baseWhere = { ticket_package_id };
            const ticketsWhere = { ticket_package_id };
            if (typeof is_sold === "boolean") {
                ticketsWhere.is_sold = is_sold;
            }
            const [tickets, totalFilteredCount, totalCount, availableCount, soldCount] = yield Promise.all([
                config_1.prisma.package_ticket.findMany({
                    where: ticketsWhere,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: [{ is_sold: "asc" }, { createdAt: "desc" }],
                    include: {
                        buyer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                }),
                config_1.prisma.package_ticket.count({ where: ticketsWhere }),
                config_1.prisma.package_ticket.count({ where: baseWhere }),
                config_1.prisma.package_ticket.count({
                    where: { ticket_package_id, is_sold: false },
                }),
                config_1.prisma.package_ticket.count({
                    where: { ticket_package_id, is_sold: true },
                }),
            ]);
            return {
                tickets,
                totalCount,
                availableCount,
                soldCount,
                totalFilteredCount,
                page,
                totalPages: Math.ceil(totalFilteredCount / limit) || 1,
                hasNextPage: page * limit < totalFilteredCount,
                hasPrevPage: page > 1,
            };
        });
    }
    /**
     * Get paginated pre-generated tickets (with optional status filter) for public user ticket view.
     */
    static getPublicTickets(ticket_package_id_1) {
        return __awaiter(this, arguments, void 0, function* (ticket_package_id, page = 1, limit = 100, status) {
            const baseWhere = { ticket_package_id };
            const ticketsWhere = { ticket_package_id };
            if (status === "available") {
                ticketsWhere.is_sold = false;
            }
            else if (status === "sold") {
                ticketsWhere.is_sold = true;
            }
            const [tickets, totalFilteredCount, totalCount, availableCount, soldCount] = yield Promise.all([
                config_1.prisma.package_ticket.findMany({
                    where: ticketsWhere,
                    skip: (page - 1) * limit,
                    take: limit,
                    select: {
                        id: true,
                        ticket_number: true,
                        is_sold: true,
                    },
                    orderBy: [{ is_sold: "asc" }, { createdAt: "asc" }],
                }),
                config_1.prisma.package_ticket.count({ where: ticketsWhere }),
                config_1.prisma.package_ticket.count({ where: baseWhere }),
                config_1.prisma.package_ticket.count({
                    where: { ticket_package_id, is_sold: false },
                }),
                config_1.prisma.package_ticket.count({
                    where: { ticket_package_id, is_sold: true },
                }),
            ]);
            return {
                tickets,
                totalCount,
                availableCount,
                soldCount,
                totalFilteredCount,
                page,
                totalPages: Math.ceil(totalFilteredCount / limit) || 1,
                hasNextPage: page * limit < totalFilteredCount,
                hasPrevPage: page > 1,
            };
        });
    }
    /**
     * Delete an unsold pre-generated ticket.
     */
    static deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield config_1.prisma.package_ticket.findUnique({
                where: { id },
            });
            if (!ticket) {
                throw new Error("Ticket not found");
            }
            if (ticket.is_sold) {
                throw new Error("Cannot delete a ticket that has already been sold");
            }
            return config_1.prisma.package_ticket.delete({
                where: { id },
            });
        });
    }
}
exports.default = PackageTicketService;
