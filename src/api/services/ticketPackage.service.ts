import { prisma } from "../../config";
import { TicketPackageType } from "../validators";

class TicketPackageService {
  public static async create(data: TicketPackageType) {
    const ticketPackage = await prisma.ticketpackage.create({
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return ticketPackage;
  }



  public static async getAllActive() {
    const ticketPackages = await prisma.ticketpackage.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        number_of_tickets: true,
        paid_tickets: true,
        free_tickets: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        is_active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return ticketPackages;
  }

  public static async getAll() {
    const ticketPackages = await prisma.ticketpackage.findMany({
      select: {
        id: true,
        name: true,
        number_of_tickets: true,
        paid_tickets: true,
        free_tickets: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        is_active: true,
      },orderBy: {createdAt: "desc"}
    });
    return ticketPackages;
  }

  public static async getById(id: number) {
    const ticketPackage = await prisma.ticketpackage.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        number_of_tickets: true,
        paid_tickets: true,
        free_tickets: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        is_active: true,
      },
    });
    return ticketPackage;
  }

  public static async update(id: number, data: Partial<TicketPackageService>) {
    const ticketPackage = await prisma.ticketpackage.update({
      where: {
        id,
      },
      data,
    });
    return ticketPackage;
  }

  public static async deleteById(id: number) {
    const ticketPackage = await prisma.ticketpackage.delete({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
    return ticketPackage;
  }
}

export default TicketPackageService;
