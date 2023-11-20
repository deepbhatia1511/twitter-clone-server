import { prismaClient } from "../../clients/db"
import JWTService from "../../services/jwt"
import { GraphqlContext } from "../../interfaces"
import { GoogleTokenResult } from "../../interfaces"
import axios from "axios"


const cc = {
   verifyGoogleToken: async(parent: any, {token}:{token: string}) => {
      const googleToken = token
      const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo")
      googleOAuthURL.searchParams.set("id_token", googleToken)
      
      const {data} = await axios.get<GoogleTokenResult>(googleOAuthURL.toString(), {
         responseType: "json"
      })
      console.log(data)
      console.log("hellooooooooo")
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
      if(!createdUser) throw new Error ("Unable to create user.")
      
      const userToken = JWTService.generateTokenForUser(createdUser)
      return userToken
   },
   
   getCurrentUser: async(parent: any, args: any, ctx: GraphqlContext) => {
      console.log(ctx)
      const id = ctx.user?.id
      if(!id) return null
      
      const user = await prismaClient.user.findUnique({where: {id}})
      return user
   }
}

export const dd = {cc}
