import {BlogsControllers} from './controllers/blogsControllers';
import {BlogsService} from './domain/blogs-service';
import {BlogsRepository} from './repositories/blogsRepository';
import {BlogsQueryRepository} from './repositories/blogsQueryRepository';
import {PostsService} from '../posts/domain/posts-service';
import {PostsQueryRepository} from '../posts/repositories/postsQueryRepository';

const blogsRepository = new BlogsRepository()
const blogsQueryRepository = new BlogsQueryRepository()
const blogsService = new BlogsService(blogsRepository)

const postsQueryRepository = new PostsQueryRepository()
const postsService = new PostsService()

export const blogsControllers = new BlogsControllers(blogsService, blogsQueryRepository, postsService, postsQueryRepository)