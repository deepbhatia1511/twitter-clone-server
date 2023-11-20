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
const db_1 = require("../../clients/db");
const jwt_1 = __importDefault(require("../../services/jwt"));
const axios_1 = __importDefault(require("axios"));
const cc = {
    verifyGoogleToken: (parent, { token }) => __awaiter(void 0, void 0, void 0, function* () {
        const googleToken = token;
        const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOAuthURL.searchParams.set("id_token", googleToken);
        const { data } = yield axios_1.default.get(googleOAuthURL.toString(), {
            responseType: "json"
        });
        console.log(data);
        console.log("hellooooooooo");
        const existingUser = yield db_1.prismaClient.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser)
            throw new Error("User with this email already exists.");
        if (!existingUser) {
            yield db_1.prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImage: data.picture,
                }
            });
        }
        const createdUser = yield db_1.prismaClient.user.findUnique({
            where: { email: data.email }
        });
        if (!createdUser)
            throw new Error("Unable to create user.");
        const userToken = jwt_1.default.generateTokenForUser(createdUser);
        return userToken;
    }),
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        console.log(ctx);
        const id = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return null;
        const user = yield db_1.prismaClient.user.findUnique({ where: { id } });
        return user;
    })
};
exports.dd = { cc };
