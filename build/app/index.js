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
exports.initServer = void 0;
// GRAPHQL SERVER INITIALIZATION
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const body_parser_1 = __importDefault(require("body-parser"));
const express4_1 = require("@apollo/server/express4");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
const user_1 = require("./user");
const tweet_1 = require("./tweet");
const jwt_1 = __importDefault(require("../services/jwt"));
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        app.get("/", (req, res) => {
            res.status(200).json({ message: "Everything is good!" });
        });
        // GraphqlContext defines the structure of context object that can be passed to Apollo Server.
        const server = new server_1.ApolloServer({
            typeDefs: `                                               
         ${user_1.User.aa}
         ${tweet_1.Tweet.aaa}
                  
         type Query {
            ${user_1.User.bb}
            ${tweet_1.Tweet.bbb}
         }
         type Mutation {
            ${user_1.User.cc}
            ${tweet_1.Tweet.ccc}
         }
      `,
            resolvers: Object.assign(Object.assign({ Query: Object.assign(Object.assign({}, user_1.User.dd.bbresolver), tweet_1.Tweet.ddd.bbbresolver), Mutation: Object.assign(Object.assign({}, user_1.User.dd.ccresolver), tweet_1.Tweet.ddd.cccresolver) }, user_1.User.dd.extraResolvers), tweet_1.Tweet.ddd.extraResolvers)
        });
        yield server.start();
        app.use('/graphql', (0, express4_1.expressMiddleware)(server, { context: ({ req, res }) => __awaiter(this, void 0, void 0, function* () {
                return {
                    user: req.headers.authorization ? jwt_1.default.decodeToken(req.headers.authorization.split("Bearer ")[1]) : undefined,
                };
            })
        }));
        return app;
    });
}
exports.initServer = initServer;
// The context function is an optional asynchronous function which returns an object that  "all your server's resolvers share"  during an operation's execution.
