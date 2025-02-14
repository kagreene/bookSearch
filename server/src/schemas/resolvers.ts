import  User  from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

// define types for arguments
//interfaces: addBookArgs (use book input), loginArgs, newUserArgs, removeBookArgs

interface loginArgs {
  email: string;
  password: string;
}

interface addUserArgs {
  input: {
  username: string;
  email: string;
  password: string;
}
}

interface addBookArgs {
  input: {
    authors: string[];
    description: string;
    bookId: string;
    image: string;
    link: string;
    title: string;
  }
}

const resolvers = {
    Query: {
// Queries to add: Me (to get authenticated user information), user(username or id: String!)
    // for me query, use context to check is user is authenticated. if user is authenticated, return the user's book data. if not, throw an Authentication error
    me: async (_parent: any, _args: any, context: any) => {
      // If the user is authenticated, find and return the user's information along with their saved books
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      // If the user is not authenticated, throw an AuthenticationError
      throw new AuthenticationError('Could not authenticate user.');
    },
    // get a single user by either their id or their username
    user: async (_parent: any, { username }: any) => {
      return User.findOne({ username }).populate('savedBooks');
    },
    Mutation: {
// Mutations to add: login, addUser, saveBook, removeBook
      addUser: async (_parent: any, { input }: addUserArgs) => {
        const user = await User.create(input);
        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      },
    },
    login: async (_parent: any, { email, password }: loginArgs) => {
      // Find a user with the provided email
      const user = await User.findOne({ email });
    
      // If no user is found, throw an AuthenticationError
      if (!user) {
        throw new AuthenticationError('Could not authenticate user.');
      }
    
      // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);
    
      // If the password is incorrect, throw an AuthenticationError
      if (!correctPw) {
        throw new AuthenticationError('Could not authenticate user.');
      }
    
      // Sign a token with the user's information
      const token = signToken(user.username, user.email, user._id);
    
      // Return the token and the user
      return { token, user };
    },
    saveBook: async (_parent: any, { input }: addBookArgs, context: any) => {
      // If the user is authenticated, add the book to their savedBooks
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        );
        return updatedUser;
      }
      // If the user isn't authenticated, throw an AuthenticationError
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (_parent: any, { bookId }: any, context: any) => {
      // If the user is authenticated, remove the book from their savedBooks
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      // If the user isn't authenticated, throw an AuthenticationError
      throw new AuthenticationError('You need to be logged in!');
    },
}};

export default resolvers;