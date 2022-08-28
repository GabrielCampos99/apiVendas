import AppError from '@shared/errors/AppError';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';

import { getCustomRepository } from 'typeorm';
import User from '../typeorm/entities/User';
import UsersRepository from '../typeorm/repositories/UsersRepository';

interface IRequest {
  email: string;
  password: string;
}

interface ICreateSessionPromise {
  user: User;
  token: string;
}

class CreateSessionsService {
  public async execute({
    email,
    password,
  }: IRequest): Promise<ICreateSessionPromise> {
    const usersRepository = getCustomRepository(UsersRepository);
    const user = await usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Incorrect email/password combination.', 401);
    }

    const passwordConfirmed = await bcrypt.compare(password, user.password);

    if (!passwordConfirmed) {
      throw new AppError('Incorrect email/password combination.', 401);
    }

    const token = sign({}, '51866f43f1b3a48d465e477ed51a52cd', {
      subject: user.id,
      expiresIn: '1d',
    });

    return { user, token };
  }
}

export default CreateSessionsService;
