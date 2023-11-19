import { User } from "@prisma/client"
import JWT from "jsonwebtoken"
import { JWTuser } from "../interfaces"

const JWT_SECRET = "this_is_a_twitter_clone"

export default class JWTService {
   public static generateTokenForUser(user: User) {
      const payload: JWTuser = {
         id: user?.id,
         email: user?.email
      }
      const token = JWT.sign(payload, JWT_SECRET)
      return token
   }
   
   public static decodeToken(token: string) {
      return JWT.verify(token, JWT_SECRET) as JWTuser
   }
}
