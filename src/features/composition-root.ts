import {BlogsControllers} from './blogs/controllers/blogsControllers';
import {BlogsService} from './blogs/application/blogsService';
import {BlogsRepository} from './blogs/infrastructure/blogsRepository';
import {BlogsQueryRepository} from './blogs/infrastructure/blogsQueryRepository';
import {PostsService} from './posts/application/postsService';
import {PostsQueryRepository} from './posts/infrastructure/postsQueryRepository';
import {Container} from 'inversify';
import {PostsControllers} from './posts/controllers/postsControllers';
import {PostsRepository} from './posts/infrastructure/postsRepository';
import {AuthControllers} from './auth/controllers/authControllers';
import {AuthService} from './auth/application/authService';
import {AuthRepository} from './auth/infrastructure/authRepository';
import {AuthQueryRepository} from './auth/infrastructure/authQueryRepository';
import {SecurityControllers} from './security/controllers/securityControllers';
import {SecurityService} from './security/application/securityService';
import {SecurityRepository} from './security/repositories/securityRepository';
import {SecurityQueryRepository} from './security/repositories/securityQueryRepository';
import {UsersControllers} from './users/controllers/usersControllers';
import {UsersService} from './users/application/usersService';
import {UsersRepository} from './users/infrastructure/usersRepository';
import {UsersQueryRepository} from './users/infrastructure/usersQueryRepository';
import {CommentsControllers} from './comments/controllers/commentsControllers';
import {CommentsService} from './comments/application/commentsService';
import {CommentsRepository} from './comments/repositories/commentsRepository';
import {CommentsQueryRepository} from './comments/repositories/commentsQueryRepository';

export const container = new Container()

container.bind<BlogsControllers>(BlogsControllers).to(BlogsControllers)
container.bind<BlogsService>(BlogsService).to(BlogsService)
container.bind<BlogsRepository>(BlogsRepository).to(BlogsRepository)
container.bind<BlogsQueryRepository>(BlogsQueryRepository).to(BlogsQueryRepository)

container.bind<PostsControllers>(PostsControllers).to(PostsControllers)
container.bind<PostsService>(PostsService).to(PostsService)
container.bind<PostsRepository>(PostsRepository).to(PostsRepository)
container.bind<PostsQueryRepository>(PostsQueryRepository).to(PostsQueryRepository)

container.bind<AuthControllers>(AuthControllers).to(AuthControllers)
container.bind<AuthService>(AuthService).to(AuthService)
container.bind<AuthRepository>(AuthRepository).to(AuthRepository)
container.bind<AuthQueryRepository>(AuthQueryRepository).to(AuthQueryRepository)

container.bind<SecurityControllers>(SecurityControllers).to(SecurityControllers)
container.bind<SecurityService>(SecurityService).to(SecurityService)
container.bind<SecurityRepository>(SecurityRepository).to(SecurityRepository)
container.bind<SecurityQueryRepository>(SecurityQueryRepository).to(SecurityQueryRepository)

container.bind<UsersControllers>(UsersControllers).to(UsersControllers)
container.bind<UsersService>(UsersService).to(UsersService)
container.bind<UsersRepository>(UsersRepository).to(UsersRepository)
container.bind<UsersQueryRepository>(UsersQueryRepository).to(UsersQueryRepository)

container.bind<CommentsControllers>(CommentsControllers).to(CommentsControllers)
container.bind<CommentsService>(CommentsService).to(CommentsService)
container.bind<CommentsRepository>(CommentsRepository).to(CommentsRepository)
container.bind<CommentsQueryRepository>(CommentsQueryRepository).to(CommentsQueryRepository)