//import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

export const authenticateToken = ({req}: any) => {
  let token = req.body.token || req.query.token || req.headers.authorization; 
  //console.log("Request: ", req);
  console.log("Icoming Authorizaton Header: ", req.headers.authorization);
  if (req?.headers?.authorization?.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }
  console.log("Extracted token: ", token);
  if (!token) {
    console.log('No token found');
    return req;
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET_KEY || '') as JwtPayload;
    //const {data}: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2hr'});
    console.log("Token verified: ", data);
    req.user = data as JwtPayload;
  } catch (error) {
   // console.log('Invalid token');
    throw new GraphQLError('Invalid token');
  }
  return req; 
  // const authHeader = req.headers.authorization;

  // if (authHeader) {
  //   const token = authHeader.split(' ')[1];

  //   const secretKey = process.env.JWT_SECRET_KEY || '';

  //   jwt.verify(token, secretKey, (err, user) => {
  //     if (err) {
  //       return res.sendStatus(403); // Forbidden
  //     }

  //     req.user = user as JwtPayload;
  //     return next();
  //   });
  // } else {
  //   res.sendStatus(401); // Unauthorized
  // }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  //const payload = { username, email, _id };
  //const secretKey: any = process.env.JWT_SECRET_KEY || '';

  //return jwt.sign({data: payload}, secretKey, { expiresIn: '2h' });
  if (!process.env.JWT_SECRET_KEY) {
    console.log('No secret key');
  }
  console.log("singing token for user:" , username);
  const payload = { username, email, _id };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY || '',
    { expiresIn: '2h' }
  );
  // return jwt.sign(
  //   {_id: user._id, username: user.username, email: user.email}, 
  //   process.env.JWT_SECRET_KEY || '',
  //   { expiresIn: '2h' }
  // );
};

export class AuthenticationError extends GraphQLError {
  constructor(message= "Could not authenticate user") {
    super(message, {
      extensions: {code: 'UNAUTHENTICATED'}
    });
    console.log("AuthenticationError: ", message);
    //super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    //Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
};
