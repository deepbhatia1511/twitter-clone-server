import { PrismaClient } from "@prisma/client"

// generate a new instance of PrismaClient and (optional) log all the queries in the console
// export const prismaClient = new PrismaClient({ log:["query"] })   

export const prismaClient = new PrismaClient()   
