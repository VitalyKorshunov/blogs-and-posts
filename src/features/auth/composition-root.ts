import {AuthService} from './domain/auth-service';
import {AuthRepository} from './repositories/authRepository';
import {UsersRepository} from '../users/repositories/usersRepository';
import {AuthControllers} from './controllers/authControllers';
import {AuthQueryRepository} from './repositories/authQueryRepository';

const authRepository = new AuthRepository()
const authQueryRepository = new AuthQueryRepository()
const userRepository = new UsersRepository()
const authService = new AuthService(authRepository, userRepository)

export const authControllers = new AuthControllers(authService, authQueryRepository)