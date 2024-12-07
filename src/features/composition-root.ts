import {BlogsControllers} from './blogs/controllers/blogsControllers';
import {BlogsService} from '../application/blogs-service';
import {BlogsRepository} from '../infrastructure/blogRepositories/blogsRepository';
import {BlogsQueryRepository} from '../infrastructure/blogRepositories/blogsQueryRepository';
import {PostsService} from '../application/posts-service';
import {PostsQueryRepository} from '../infrastructure/postRepositories/postsQueryRepository';
import {Container} from 'inversify';
import {PostsControllers} from './posts/controllers/postsControllers';
import {PostsRepository} from '../infrastructure/postRepositories/postsRepository';
import {AuthControllers} from './auth/controllers/authControllers';
import {AuthService} from '../application/auth-service';
import {AuthRepository} from '../infrastructure/authRepositories/authRepository';
import {AuthQueryRepository} from '../infrastructure/authRepositories/authQueryRepository';
import {SecurityControllers} from './security/controllers/securityControllers';
import {SecurityService} from './security/domain/securityService';
import {SecurityRepository} from './security/repositories/securityRepository';
import {SecurityQueryRepository} from './security/repositories/securityQueryRepository';
import {UsersControllers} from './users/controllers/usersControllers';
import {UsersService} from '../application/users-service';
import {UsersRepository} from '../infrastructure/userRepositories/usersRepository';
import {UsersQueryRepository} from '../infrastructure/userRepositories/usersQueryRepository';
import {CommentsControllers} from './comments/controllers/commentsControllers';
import {CommentsService} from './comments/domain/comments-service';
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