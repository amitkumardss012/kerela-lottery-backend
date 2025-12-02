import { any } from "zod";
import { prisma } from "../../config";
import { WinnerType } from "../validators";

class WinnerService {
  public static async createWinner(data: WinnerType) {
    const { lottery_id, ...winnerData } = data;
    const winner = await prisma.winner.create({
      data: {
        ...winnerData,
        lottery_id: parseInt(lottery_id),
      }
    });
    return winner;
  }

  public static async getAllWinners(page: number = 1, limit: number = 10) {
    const winners = await prisma.winner.findMany({
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        ticket_number: true,
        name: true,
        phone: true,
        email: true,
        state: true,
        prize_amount: true,
        winner_rank: true, 
        lottery_id: true, 
        claimed: true, 
        createdAt: true,
        lottery: { 
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return winners.map(winner => ({
      ...winner,
      lottery_name: winner.lottery?.name // Map to match interface
    }));
  }

  public static async getWinnerById(id: number) {
    const winner = await prisma.winner.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        ticket_number: true,
        name: true,
        phone: true,
        email: true,
        state: true,
        prize_amount: true,
        winner_rank: true,
      },
    });
    return winner;
  }


  public static async updateWinnerById(id: number, data: Partial<WinnerType>) {
    const { lottery_id, ...updateData } = data;
    const winner = await prisma.winner.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        ...(lottery_id && { lottery_id: parseInt(lottery_id) })
      },
    });
    return winner;
  }
  public static async deleteWinnerById(id: number) {
    const winner = await prisma.winner.delete({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
    return winner;
  }

  public static async searchWinner(query: string) {
    const winner = await prisma.winner.findFirst({
      where: {
        OR: [
          {
            phone: {
              contains: query,
            },
          },
          {
            name: {
              contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        ticket_number: true,
        name: true,
        phone: true,
        email: true,
        state: true,
        prize_amount: true,
        winner_rank: true,
      },
      take: 1, // Limit to return only one result
    });
    return winner;
  }

  public static async getWinnerByLottery(id: number){
    const winner = await prisma.winner.findMany({
      where: {
        lottery_id: id,
      },
      select: {
        id: true,
        ticket_number: true,
        name: true,
        phone: true,
        email: true,
        state: true,
        prize_amount: true,
      },
    });
    return winner;
  }
}

export default WinnerService;
