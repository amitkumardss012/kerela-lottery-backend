import { prisma } from "../../config";
import { EnquiryType } from "../validators";

class EnquiryService {
    public static createEnquiry = async (data: EnquiryType) => {
        const enquiry = await prisma.enquiry.create({
            data: {
                ...data,
                updatedAt: new Date(),
            }
        });
        return enquiry;
    }

    public static async getAllEnquiries(page: number = 1, limit: number = 10) {
        const enquiries = await prisma.enquiry.findMany({
            take: limit,
            skip: (page - 1) * limit,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                subject: true,
                message: true,
                isRead: true,
                createdAt: true,
            },
            orderBy: [
                { isRead: "asc" }, // First sort by isRead (ascending)
                { createdAt: "desc" } // Then sort by createdAt (descending)
              ]
              
        })
        return enquiries;
    }

    public static async getEnquiryById(id: number) {
        const enquiry = await prisma.enquiry.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                subject: true,
                message: true,
                isRead: true,
                createdAt: true,
            }
        })
        return enquiry;
    }

    public static async getUnreadEnquiries() {
        const enquiries = await prisma.enquiry.findMany({
            where: {
                isRead: false
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                subject: true,
                message: true,
                isRead: true,
                createdAt: true,
            }
        })
        return enquiries;
    }

    public static async markEnquiryAsRead(id: number) {
        const enquiry = await prisma.enquiry.update({
            where: {
                id
            },
            data: {
                isRead: true
            }
        })
        return enquiry;
    } 

    public static async deleteEnquiry(id: number) {
        const enquiry = await prisma.enquiry.delete({
            where: {
                id
            },
            select: {
                id: true,
            }
        })
        return enquiry;
    }
}

export default EnquiryService;