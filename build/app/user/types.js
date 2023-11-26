"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aa = void 0;
exports.aa = `#graphql
type User {
   id:            ID!
   firstName:     String!
   lastName:      String
   email:         String!
   profileImage:  String!
   
   tweets:         [Tweet]
}`;
