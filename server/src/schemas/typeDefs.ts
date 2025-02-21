import { gql } from 'apollo-server-express';
const typeDefs = gql`
  input BookInput {
    authors: [String]
    description: String
    bookId: ID!
    image: String
    link: String
    title: String!
  }
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
  }
    type Book {
    bookId: ID!
    authors: [String]
    description: String
    title: String!
    image: String
    link: String
    }

    type Auth {
    token: ID!
    user: User
    }

    input addUserInput {
    username: String!
    email: String!
    password: String!
    }

  type Query {
    me: User
    user(username: String!): User
    }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookData: BookInput!): User
    removeBook(bookId: ID!): User
    }
  `
  ;
export default typeDefs;