import {PostId, PostInputModel} from '../../../types/entities/posts-types';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';
import {PostsRepository} from '../infrastructure/postsRepository';
import {inject, injectable} from 'inversify';
import {HydratedBlogType} from '../../blogs/domain/blogEntity';
import {HydratedPostType, PostModel} from '../domain/postEntity';
import {UserId} from '../../../types/entities/users-types';
import {OneOfLikeStatus} from '../../../types/db/comments-db-types';
import {LikesRepository} from '../../likes/infrastructure/likesRepository';
import {HydratedLikeType, LikesModel} from '../../likes/domain/like-entity';
import {HydratedUserType} from '../../users/domain/usersEntity';
import {UsersRepository} from '../../users/infrastructure/usersRepository';

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(LikesRepository) protected likesRepository: LikesRepository,
        @inject(UsersRepository) protected usersRepository: UsersRepository,
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

        smartPost.updatePost(
            updatedPost.title,
            updatedPost.shortDescription,
            updatedPost.content,
            updatedPost.blogId,
            smartBlog.getName()
        )

        await this.postsRepository.save(smartPost)

        return result.success(null)
    }

    async updatePostLikeStatus(postId: PostId, userId: UserId, likeStatus: OneOfLikeStatus): Promise<ResultType<null>> {
        const smartPost: HydratedPostType | null = await this.postsRepository.findPostById(postId)
        if (!smartPost) return result.notFound('post not found')

        const smartUser: HydratedUserType | null = await this.usersRepository.findUserById(userId)
        if (!smartUser) return result.notFound('user not found')

        let smartLike: HydratedLikeType | null = await this.likesRepository.findLike(postId, userId)

        if (smartLike) {
            smartLike.updateLike(likeStatus)
        } else {
            smartLike = LikesModel.setLike(postId, likeStatus, userId, smartUser.login)
        }

        await this.likesRepository.save(smartLike)

        const likesAndDislikesCount = await this.likesRepository.getLikesAndDislikesCount(postId)
        const lastThreeNewestLikes = await this.likesRepository.getLastThreeNewestLikes(postId)

        smartPost.updateLikesInfo(likesAndDislikesCount, lastThreeNewestLikes)

        await this.postsRepository.save(smartPost)

        return result.success(null)
    }
}