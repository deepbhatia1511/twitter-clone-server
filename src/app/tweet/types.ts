export const aaa = `#graphql
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
`
