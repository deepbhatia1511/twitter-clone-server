"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ddd = void 0;
const prisma_1 = require("../../clients/prisma");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const redis_1 = require("../../clients/redis");
const s3client = new client_s3_1.S3Client({
    region: process.env.AWS_DEFAULT_REGION
});
const bbbresolver = {
    getAllTweets: () => __awaiter(void 0, void 0, void 0, function* () {
        const cachedTweets = yield redis_1.redisClient.get("redis_getAllTweets");
        if (cachedTweets)
            return JSON.parse(cachedTweets);
        const tweets = yield prisma_1.prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } });
        yield redis_1.redisClient.set("redis_getAllTweets", JSON.stringify(tweets));
        return tweets;
    }),
    getSignedUrlForImage: (parent, { imageName, imageType }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user || !ctx.user.id)
            throw new Error("Unauthenticated");
        const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
        if (!allowedImageTypes.includes(imageType))
            throw new Error("Image format not supported.");
        const putObjectCommand = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${ctx.user.id}/uploads/images/${imageName}${Date.now().toString()}.${imageType}`
        });
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3client, putObjectCommand);
        return signedUrl;
    })
};
const cccresolver = {
    createTweet: (parent, { payload }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user)
            throw new Error("LogIn to your account to post something.");
        const rateLimitFlag = yield redis_1.redisClient.get(`RATE_LIMIT:TWEET:${ctx.user.id}`);
        if (rateLimitFlag)
            throw new Error("Please wait...");
        const tweet = yield prisma_1.prismaClient.tweet.create({
            data: {
                content: payload.content,
                image: payload.image,
                author: { connect: { id: ctx.user.id } }
            }
        });
        yield redis_1.redisClient.setex(`RATE_LIMIT:TWEET:${ctx.user.id}`, 10, 1);
        yield redis_1.redisClient.del("redis_getAllTweets");
        return tweet;
    })
};
const extraResolvers = {
    Tweet: {
        author: (parent) => prisma_1.prismaClient.user.findUnique({ where: { id: parent.authorId } })
    }
};
exports.ddd = { bbbresolver, cccresolver, extraResolvers };
