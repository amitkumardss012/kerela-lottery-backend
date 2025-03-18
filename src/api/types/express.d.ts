import { Request } from 'express';
import { AdminType } from '../validators/admin.validator';

export declare global {
    namespace Express {
        interface Request {
            admin?: {
                id: string,
                name: string, 
                email: string,
                role: "admin" | "sub_admin"
            }
        }
    }
} 

