import { prisma } from "../../config";
import { AdminType } from "../validators";

class AdminService {
    public static async createAdmin(data: AdminType){
        const admin = await prisma.admin.create({
            data: {
                name: data.name,
                email: data.email, 
                password: data.password,
                role: 'sub_admin',
                updatedAt: new Date(),
            },
        })
        return admin
    }
    
    public static async findByEmail(email: string){
        const admin = await prisma.admin.findUnique({
            where: {
                email
            }, select: {
                id: true,
                email: true, 
                role: true,
                password: true,
            }
        })
        return admin
    }

    public static async getAllAdmin() {
        const admin = await prisma.admin.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                {createdAt: "desc"}
            ]
        })
        return admin
    }

    public static async findById(id: number){
        const admin = await prisma.admin.findUnique({
            where: {
                id
            }, select: {
                id: true, 
                name: true,
                email: true, 
                role: true,
            }
        })
        return admin;
    }

    public static async deleteById(id: number){
        const admin = await prisma.admin.delete({
            where: {
                id
            },
            select: {
                id: true,
            }
        })
        return admin
    }
}


export default AdminService;