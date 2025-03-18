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
const GenerateUniqueTicketNumber = (lottery_id) => __awaiter(void 0, void 0, void 0, function* () {
    let ticketNumber;
    let isUnique = false;
    while (!isUnique) {
        ticketNumber = `KL${Math.floor(100000 + Math.random() * 900000)}`; // Generate random ticket number
        // Check if this ticket number already exists for the given lottery_id
        const existingTicket = yield config_1.prisma.ticket.findFirst({
            where: { lottery_id, ticket_number: ticketNumber },
        });
        if (!existingTicket) {
            isUnique = true;
        }
    }
    return ticketNumber;
});
exports.default = GenerateUniqueTicketNumber;
