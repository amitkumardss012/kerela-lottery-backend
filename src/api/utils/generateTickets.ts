import { prisma } from "../../config";

const GenerateUniqueTicketNumber = async (lottery_id: number) => {
    let ticketNumber;
    let isUnique = false;
  
    while (!isUnique) {
      ticketNumber = `KL${Math.floor(100000 + Math.random() * 900000)}`; // Generate random ticket number
  
      // Check if this ticket number already exists for the given lottery_id
      const existingTicket = await prisma.ticket.findFirst({
        where: { lottery_id, ticket_number: ticketNumber },
      });
  
      if (!existingTicket) {
        isUnique = true;
      }
    }
  
    return ticketNumber;
  };
  
  export default GenerateUniqueTicketNumber;