import { prisma } from "../../config";
import { LotteryType } from "../validators";

class LotteryService {
    public static async create(data: LotteryType) {
        const lottery = await prisma.lottery.create({
            data: {
                ...data,
                updatedAt: new Date(),
            }
        })
        return lottery;
    }
    public static async getAllActive() {
        const lotteries = await prisma.lottery.findMany({
            where: {
                is_active: true
            },
            select: {
                id: true,
                name: true,
                result_time: true,
                result_date: true,
                is_active: true,
                createdAt: true,
            },
            orderBy: {createdAt: "desc"}
        })
        return lotteries;
    }

    public static async getAll() {
        const lotteries = await prisma.lottery.findMany({
            select: {
                id: true,
                name: true,
                result_time: true,
                result_date: true,
                is_active: true,
            },
            orderBy: {createdAt: "desc"}
        })
        return lotteries;
    }

    public static async getById(id: number) {
        const lottery = await prisma.lottery.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                result_time: true,
                result_date: true,
                is_active: true
            }
        })
        return lottery;
    }

    public static async update(id: number, data: Partial<LotteryType>) {
        const lottery = await prisma.lottery.update({
            where: {
                id
            },
            data
        })
        return lottery;
    }

    public static async delete(id: number) {
        const lottery = await prisma.lottery.delete({
            where: {
                id
            }, 
            select: {
                id: true,
            }
        })
        return lottery;
    }
}

export default LotteryService;