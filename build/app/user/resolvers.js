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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dd = void 0;
const prisma_1 = require("../../clients/prisma");
const jwt_1 = __importDefault(require("../../services/jwt"));
const axios_1 = __importDefault(require("axios"));
const bbresolver = {
    verifyGoogleToken: (parent, { token }) => __awaiter(void 0, void 0, void 0, function* () {
        const googleToken = token;
        const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOAuthURL.searchParams.set("id_token", googleToken);
        const { data } = yield axios_1.default.get(googleOAuthURL.toString(), {
            responseType: "json"
        });
        console.log(data);
        console.log("hellooooooooooo");
        const existingUser = yield prisma_1.prismaClient.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser)
            throw new Error("User with this email already exists.");
        if (!existingUser) {
            yield prisma_1.prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImage: data.picture,
                }
            });
        }
        const createdUser = yield prisma_1.prismaClient.user.findUnique({
            where: { email: data.email }
        });
        if (!createdUser)
            return;
        const userToken = jwt_1.default.generateTokenForUser(createdUser);
        return userToken;
    }),
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return null;
        const user = yield prisma_1.prismaClient.user.findUnique({ where: { id } });
        return user;
    }),
    getUserById: (parent, { id }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma_1.prismaClient.user.findUnique({ where: { id } });
    }),
    userLogin: (parent, { email }) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prisma_1.prismaClient.user.findUnique({ where: { email: email } });
        if (!user)
            return;
        const userToken = jwt_1.default.generateTokenForUser(user);
        return userToken;
    })
};
const ccresolver = {
    followUser: (parent, { to }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user || !ctx.user.id)
            throw new Error("You first need to log in to follow someone.");
        const from = ctx.user.id;
        yield prisma_1.prismaClient.follow.create({
            data: {
                follower: { connect: { id: from } },
                following: { connect: { id: to } }
            }
        });
        return true;
    }),
    unfollowUser: (parent, { to }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user || !ctx.user.id)
            throw new Error("You first need to log in to unfollow someone");
        const from = ctx.user.id;
        yield prisma_1.prismaClient.follow.delete({
            where: { followerId_followingId: { followerId: from, followingId: to } }
        });
        return true;
    })
};
const extraResolvers = {
    User: {
        tweets: (parent) => prisma_1.prismaClient.tweet.findMany({
            where: { author: { id: parent.id } }
        }),
        followers: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield prisma_1.prismaClient.follow.findMany({
                where: { following: { id: parent.id } },
                include: { follower: true }
            });
            return result.map((e) => e.follower);
        }),
        followings: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield prisma_1.prismaClient.follow.findMany({
                where: { follower: { id: parent.id } },
                include: { following: true }
            });
            return result.map((e) => e.following);
        })
    }
};
exports.dd = { bbresolver, ccresolver, extraResolvers };
