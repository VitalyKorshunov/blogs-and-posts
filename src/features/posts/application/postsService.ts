import {PostId, PostInputModel} from '../../../types/entities/posts-types';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';
import {PostsRepository} from '../infrastructure/postsRepository';
import {inject, injectable} from 'inversify';
import {HydratedBlogType} from '../../blogs/domain/blogEntity';
import {HydratedPostType, PostModel} from '../domain/postEntity';

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository
    ) {
    }

    async createPostInBlog(post: PostInputModel): Promise<ResultType<PostId>> {
        const smartBlog: HydratedBlogType | null = await this.postsRepository.findBlogById(post.blogId)

        if (!smartBlog) return result.notFound('blog not found')

        const smartPost: HydratedPostType = PostModel.createPost(
            post.title,
            post.content,
            post.shortDescription,
            post.blogId,
            smartBlog.getName()
        )

        await this.postsRepository.save(smartPost)

        return result.success(smartPost.getId())
    }

    async deletePost(id: PostId): Promise<ResultType<boolean>> {
        const isPostDeleted = await this.postsRepository.deletePost(id)

        return result.success(isPostDeleted)
    }

    async updatePost(updatedPost: PostInputModel, id: PostId): Promise<ResultType<null>> {
        const smartBlog: HydratedBlogType | null = await this.postsRepository.findBlogById(updatedPost.blogId)

        if (!smartBlog) return result.notFound('blog not found')

        const smartPost = await this.postsRepository.findPostById(id)

        if (!smartPost) return result.notFound('post not found')

        smartPost.update(
            updatedPost.title,
            updatedPost.shortDescription,
            updatedPost.content,
            updatedPost.blogId,
            smartBlog.getName()
        )

        await this.postsRepository.save(smartPost)

        return result.success(null)
    }
}