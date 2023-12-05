import { Tweet } from "@prisma/client"
import { prismaClient } from "../../clients/prisma"
import { GraphqlContext } from "../../interfaces"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { redisClient } from "../../clients/redis"

interface createTweetPayload {
   content: string
   image?: string
}

const s3client = new S3Client({
   region: process.env.AWS_DEFAULT_REGION
})

const bbbresolver = {
   getAllTweets: async () => {
      const cachedTweets = await redisClient.get("redis_getAllTweets")
      if(cachedTweets) return JSON.parse(cachedTweets)
      const tweets = await prismaClient.tweet.findMany({orderBy: {createdAt: "desc"}})
      await redisClient.set("redis_getAllTweets", JSON.stringify(tweets))
      return tweets
   },
   
   getSignedUrlForImage: async (parent: any, {imageName, imageType}:{imageName: string, imageType: string}, ctx: GraphqlContext) => {
      if(!ctx.user || !ctx.user.id) throw new Error("Unauthenticated")
      const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"]
      if(!allowedImageTypes.includes(imageType)) throw new Error("Image format not supported.")
      const putObjectCommand = new PutObjectCommand({
         Bucket: process.env.AWS_S3_BUCKET,
         Key: `${ctx.user.id}/uploads/images/${imageName}${Date.now().toString()}.${imageType}`
      })
      const signedUrl = await getSignedUrl(s3client, putObjectCommand)
      return signedUrl
   }
}

const cccresolver = {
   createTweet: async (parent: any, {payload}:{payload: createTweetPayload}, ctx: GraphqlContext) => {
      if(!ctx.user) throw new Error("LogIn to your account to post something.")
      const rateLimitFlag = await redisClient.get(`RATE_LIMIT:TWEET:${ctx.user.id}`)
      if(rateLimitFlag) throw new Error("Please wait...")
      const tweet = await prismaClient.tweet.create({
         data: {
            content: payload.content,
            image: payload.image,
            author: {connect: {id: ctx.user.id}}
         }
      })
      await redisClient.setex(`RATE_LIMIT:TWEET:${ctx.user.id}`, 10, 1)
      await redisClient.del("redis_getAllTweets")
      return tweet
   }
}

const extraResolvers = {
   Tweet: {
      author: (parent: Tweet) => prismaClient.user.findUnique({where: {id: parent.authorId}})
   }
}

export const ddd = {bbbresolver, cccresolver, extraResolvers}
