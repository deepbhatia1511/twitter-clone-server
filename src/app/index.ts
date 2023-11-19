// GRAPHQL SERVER INITIALIZATION
import express from 'express';
import { ApolloServer } from '@apollo/server';
import bodyParser from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import cors from "cors";
const app = express()
app.use(bodyParser.json())
app.use(cors())

import { User } from "./user"
import { GraphqlContext } from '../interfaces';
import JWTService from '../services/jwt';

export async function initServer() {
   // GraphqlContext defines the structure of context object that can be passed to Apollo Server.
   const server = new ApolloServer<GraphqlContext>({ 
      typeDefs: `                                               
         ${User.aa},
         type Query {
            ${User.bb}
         }
      `,
      resolvers: {
         Query: {
            ...User.dd.cc
         }
      }
   })
   
   await server.start()
   app.use('/graphql', expressMiddleware(server, { 
      context: async({req, res}) => {
         return{
            user: req.headers.authorization ? JWTService.decodeToken(req.headers.authorization.split(" ")[1]) : undefined
         }
      }
   }))
   return app
}

// The context function is an optional asynchronous function which returns an object that  "all your server's resolvers share"  during an operation's execution.
