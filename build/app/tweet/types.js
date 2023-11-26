"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aaa = void 0;
exports.aaa = `#graphql
   input createTweetData {
      content:       String!
      image:         String
   }
   
   type Tweet {
      id:            ID!
      content:       String!
      image:         String
      author:        User
   }
`;
