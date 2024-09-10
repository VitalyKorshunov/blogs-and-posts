import {Request, Response} from 'express';
import {BlogPostFilterViewModel} from '../../../input-output-types/blogs-types';
import {blogsService} from '../domain/blogs-service';
import {ParamType, SearchQueryType} from '../some';

export const sortBlogPostsController = async (req: Request<ParamType, {}, {}, SearchQueryType>, res: Response<BlogPostFilterViewModel>)=>  {
    const sortedPosts: BlogPostFilterViewModel = await blogsService.sortBlogPostService(req.params.id, req.query)

    res.status(200).json(sortedPosts)
}