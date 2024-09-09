import {Request, Response} from 'express';
import {blogsService} from '../domain/blogs-service';
import {BlogPostInputModel, PostId, PostViewModel} from '../../../input-output-types/posts-types';
import {postsService} from '../../posts/domain/posts-service';

export const createPostForBlogController = async (req: Request<{id: string}, {}, BlogPostInputModel>, res: Response) => {
    const postId: PostId = await blogsService.createPostForBlog(req.params.id, req.body)
    const post: PostViewModel = await postsService.findAndMap(postId)

    res
        .status(201)
        .json(post)
}