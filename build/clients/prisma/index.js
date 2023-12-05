"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaClient = void 0;
const client_1 = require("@prisma/client");
// generate a new instance of PrismaClient and (optional) log all the queries in the console
// export const prismaClient = new PrismaClient({ log:["query"] })   
exports.prismaClient = new client_1.PrismaClient();
