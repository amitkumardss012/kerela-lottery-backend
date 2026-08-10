import { prisma } from "../../config";
import { TicketPackageType } from "../validators";

class TicketPackageService {
  public static async create(data: TicketPackageType) {
    const ticketPackage = await prisma.ticketpackage.create({
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        lottery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return ticketPackage;
  }

  public static async getAllActive() {
    const ticketPackages = await prisma.ticketpackage.findMany({
      where: {
        is_active: true,
      },
      include: {
        lottery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return ticketPackages;
  }

  public static async getAll() {
    const ticketPackages = await prisma.ticketpackage.findMany({
      include: {
        lottery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return ticketPackages;
  }

  public static async getById(id: number) {
    const ticketPackage = await prisma.ticketpackage.findUnique({
      where: {
        id,
      },
      include: {
        lottery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return ticketPackage;
  }

  public static async update(id: number, data: Partial<TicketPackageType>) {
    const ticketPackage = await prisma.ticketpackage.update({
      where: {
        id,
      },
      data,
      include: {
        lottery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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
        image: true,
      },
    });
    return ticketPackage;
  }
}

export default TicketPackageService;

