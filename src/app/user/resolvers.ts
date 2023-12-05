import { prismaClient } from "../../clients/prisma"
import JWTService from "../../services/jwt"
import { GraphqlContext } from "../../interfaces"
import { GoogleTokenResult } from "../../interfaces"
import axios from "axios"
import { Prisma, User } from "@prisma/client"


const bbresolver = {
   verifyGoogleToken: async(parent: any, {token}:{token: string}) => {
      const googleToken = token
      const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo")
      googleOAuthURL.searchParams.set("id_token", googleToken)
      
      const {data} = await axios.get<GoogleTokenResult>(googleOAuthURL.toString(), {
         responseType: "json"
      })
      console.log(data)
      console.log("hellooooooooooo")
      const existingUser = await prismaClient.user.findUnique({
         where: {email: data.email}
      })
      
      if(existingUser) throw new Error ("User with this email already exists.")
      if(!existingUser){
         await prismaClient.user.create({
            data: {
               email: data.email,
               firstName: data.given_name,
               lastName: data.family_name,
               profileImage: data.picture,
            }
         })
      }
      
      const createdUser = await prismaClient.user.findUnique({
         where: {email: data.email}
      }) 
      if(!createdUser) return
      
      const userToken = JWTService.generateTokenForUser(createdUser)
      return userToken
   },
   
   getCurrentUser: async(parent: any, args: any, ctx: GraphqlContext) => {
      const id = ctx.user?.id
      if(!id) return null
      
      const user = await prismaClient.user.findUnique({where: {id}})
      return user
   },
   
   getUserById: async(parent: any, {id}:{id: string}, ctx: GraphqlContext) => {
      return prismaClient.user.findUnique({where: {id}})
   },
   
   userLogin: async(parent: any, {email}:{email: string}) => {
      const user = await prismaClient.user.findUnique({where: {email: email}})
      if(!user) return
      const userToken = JWTService.generateTokenForUser(user)
      return userToken
   }
}

const ccresolver = {
   followUser: async (parent: any, {to}:{to: string}, ctx: GraphqlContext) => {
      if(!ctx.user || !ctx.user.id) throw new Error("You first need to log in to follow someone.")
      const from = ctx.user.id
      await prismaClient.follow.create({
         data: {
            follower: {connect: {id: from}},
            following: {connect: {id: to}}
         }
      })
      return true
   },
   
   unfollowUser: async (parent: any, {to}:{to: string}, ctx: GraphqlContext) => {
      if(!ctx.user || !ctx.user.id) throw new Error("You first need to log in to unfollow someone")
      const from = ctx.user.id
      await prismaClient.follow.delete({
         where: {followerId_followingId: {followerId: from, followingId: to}}
      })
      return true
   }
}

const extraResolvers = {
   User: {
      tweets: (parent: User) => prismaClient.tweet.findMany({
         where: {author :{id: parent.id}}
      }),
      followers: async (parent: User) => {
         const result = await prismaClient.follow.findMany({
            where: {following :{id: parent.id}},
            include: {follower: true}
         })
         return result.map((e) => e.follower)
      },
      followings: async (parent: User) => {                                    // I you want to get this users's "followings"
         const result = await prismaClient.follow.findMany({                   // Go to Follow table
            where: {follower :{id: parent.id}},                                // and search where this user is the follower
            include: {following: true}
         })
         return result.map((e) => e.following)
      }
   }
}

export const dd = {bbresolver, ccresolver, extraResolvers}
