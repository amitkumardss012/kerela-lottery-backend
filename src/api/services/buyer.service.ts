// import { prisma } from "../../config";

// class BuyerService {
//   public static async getAllBuyers(page: number, limit: number) {
//     const buyers = await prisma.buyer.findMany({
//       take: limit,
//       skip: (page - 1) * limit,
//       include: {
//         ticketPackage: {
//           include: {
//             ticket: {
//               where: {
//                 ticket_package_id: { not: undefined }, // Ensuring only relevant tickets are fetched
//               },
//               select: {
//                 id: true,
//                 lottery_id: true,
//                 ticket_package_id: true,
//                 ticket_number: true,
//                 createdAt: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//     return buyers;
//   }

//   public static async getBuyerByEmail(
//     email: string,
//     phone?: string,
//     transaction_id?: string
//   ) {
//     const buyer = await prisma.buyer.findFirst({
//       where: {
//         OR: [
//           {
//             email: {
//               contains: email,
//             },
//           },
//           {
//             phone: {
//               contains: phone,
//             },
//           },
//           {
//             transaction_id: {
//               contains: transaction_id,
//             },
//           },
//         ],
//       },
//       select: {
//         id: true,
//         email: true,
//       },
//     });
//     return buyer;
//   }

//   public static async getBuyerById(id: number) {
//     const buyer = await prisma.buyer.findUnique({
//       where: { id },
//       include: {
//         ticketPackage: {
//           include: {
//             ticket: {
//               where: {
//                 ticket_package_id: { not: undefined }, // Fetch only relevant tickets
//               },
//               select: {
//                 id: true,
//                 lottery_id: true,
//                 ticket_package_id: true,
//                 ticket_number: true,
//                 createdAt: true,
//               },
//             },
//           },
//         },
//       },
//     });
//     return buyer;
//   }

//   public static async deleteById(id: number) {
//     const buyer = await prisma.buyer.delete({
//       where: {
//         id,
//       },
//       select: {
//         id: true,
//       },
//     });
//     return buyer;
//   }

//   public static async searchBuyer(query: string) {
//     const buyer = await prisma.buyer.findMany({
//       where: {
//         OR: [
//           {
//             name: {
//               contains: query,
//             },
//           },
//           {
//             email: {
//               contains: query,
//             },
//           },
//           {
//             phone: {
//               contains: query,
//             },
//           },
//         ],
//       },
//     });
//     return buyer;
//   }
// }

// export default BuyerService;
