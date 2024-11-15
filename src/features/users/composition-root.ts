import {Container} from 'inversify';
import {UsersControllers} from './controllers/usersControllers';
import {UsersService} from './domain/users-service';
import {UsersRepository} from './repositories/usersRepository';
import {UsersQueryRepository} from './repositories/usersQueryRepository';

export const container = new Container()

container.bind(UsersControllers).to(UsersControllers)
container.bind(UsersService).to(UsersService)
container.bind(UsersRepository).to(UsersRepository)
container.bind(UsersQueryRepository).to(UsersQueryRepository)