import { Tweet } from "@prisma/client"
import { prismaClient } from "../../clients/db"
import { GraphqlContext } from "../../interfaces"

interface createTweetPayload {
   content: string
   image?: string
}

const bbbresolver = {
   getAllTweets: () => prismaClient.tweet.findMany({orderBy: {createdAt: "desc"}})
}

const cccresolver = {
   createTweet: async (parent: any, {payload}:{payload: createTweetPayload}, ctx: GraphqlContext) => {
      if(!ctx.user) throw new Error("LogIn to your account to post something")
      const tweet = await prismaClient.tweet.create({
         data: {
            content: payload.content,
            image: payload.image,
            author: {connect: {id: ctx.user.id}}
         }
      })
      return tweet
   }
}

const extraResolvers = {
   Tweet: {
      author: (parent: Tweet) => prismaClient.user.findUnique({where: {id: parent.authorId}})
   }
}

export const ddd = {bbbresolver, cccresolver, extraResolvers}
