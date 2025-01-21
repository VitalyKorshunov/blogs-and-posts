import {PostDbType, PostsQueryDbType} from '../../../types/db/post-db-types'
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType,} from '../../../types/db/query-db-types';
import {PostId, PostsSortViewModel, PostViewModel} from '../../../types/entities/posts-types';
import {sortQueryFieldsUtils} from '../../../common/utils/sortQueryFields.utils';
import {SortOutputQueryType} from '../../../types/utils/sort-types';
import {injectable} from 'inversify';
import {PostModel} from '../domain/postEntity';
import {LikeStatus} from '../../../types/db/comments-db-types';
import {PostIdWithPostUserLikeStatus} from '../../../types/entities/likes-types';
import {HydratedLikeType, LikesModel} from '../../likes/domain/like-entity';
import {UserId} from '../../../types/entities/users-types';
import {BlogId} from '../../../types/entities/blogs-types';

@injectable()
export class PostsQueryRepository {
    private toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    async findUserLikeStatusForPosts(postIds: PostId[], userId: string): Promise<PostIdWithPostUserLikeStatus[]> {
        const postObjectIds = postIds.map(id => new ObjectId(id))

        const postsLikes: HydratedLikeType[] = await LikesModel.find({
            parentId: {$in: postObjectIds},
            userId: new ObjectId(userId)
        })

        const result: PostIdWithPostUserLikeStatus[] = postObjectIds.map(postId => {
            const postLikeFound = postsLikes.find(post => post.parentId.toString() === postId.toString())

            return postLikeFound
                ? this.mapToPostUserInfoWithCorrectId(postLikeFound)
                : {postId: postId.toString(), myStatus: LikeStatus.None}
        })

        return result
    }

    async findPostById(postId: PostId, userId: UserId | null): Promise<PostViewModel> {
        const post: WithId<PostDbType> | null = await PostModel.findOne(this.toIdQuery(postId))

        if (post) {
            const postIdWithPostUserLikeStatus: PostIdWithPostUserLikeStatus[] =
                userId
                    ? await this.findUserLikeStatusForPosts([postId], userId)
                    : [{postId: postId, myStatus: LikeStatus.None}]

            return this.mapToPostViewModel(post, postIdWithPostUserLikeStatus[0])
        } else {
            throw new Error('post not found (postsQueryRepository.findAndMap)')
        }
    }

    async isPostFound(id: PostId): Promise<boolean> {
        const post: number = await PostModel.countDocuments(this.toIdQuery(id));

        return !!post
    }

    async getAllSortedPosts(query: any, userId: string | null, blogId?: BlogId): Promise<PostsSortViewModel> {
        const queryFindAllPostsOrForBlog =
            blogId
                ? {blogId: new ObjectId(blogId)}
                : {}

        const sortedQueryFields: SortOutputQueryType = sortQueryFieldsUtils(query)
        const filter: PostsQueryDbType = {
            ...sortedQueryFields,
        }

        const posts: WithId<PostDbType>[] = await PostModel
            .find(queryFindAllPostsOrForBlog)
            .sort({[filter.sortBy]: filter.sortDirection})
            .skip(filter.countSkips)
            .limit(filter.pageSize)

        const totalPostsCount = await PostModel.countDocuments(queryFindAllPostsOrForBlog)
        const pagesCount = Math.ceil(totalPostsCount / filter.pageSize)

        const postIds: PostId[] = posts.map(post => post._id.toString())

        const postIdsWithUserLikeStatus: PostIdWithPostUserLikeStatus [] =
            userId
                ? await this.findUserLikeStatusForPosts(postIds, userId)
                : postIds.map(postId => ({postId: postId, myStatus: LikeStatus.None}))

        return {
            pagesCount: pagesCount,
            page: filter.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalPostsCount,
            items: posts.map(post => {
                const postLikeFound = postIdsWithUserLikeStatus.find(postWithUserLikeStatus => postWithUserLikeStatus.postId === post._id.toString()) ?? {
                    postId: post._id.toString(),
                    myStatus: LikeStatus.None
                }

                return this.mapToPostViewModel(post, postLikeFound)
            })
        }
    }

    private mapToPostViewModel(post: WithId<PostDbType>, postIdWithPostUserLikeStatus: PostIdWithPostUserLikeStatus): PostViewModel {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
            extendedLikesInfo: {
                likesCount: post.likesAndDislikesInfo.countPostsLikesAndDislikes.likesCount,
                dislikesCount: post.likesAndDislikesInfo.countPostsLikesAndDislikes.dislikesCount,
                myStatus: postIdWithPostUserLikeStatus.myStatus,
                newestLikes: post.likesAndDislikesInfo.postsUserLikeStatusInfo
            }
        }
    }

    private mapToPostUserInfoWithCorrectId(postLikeFound: HydratedLikeType): PostIdWithPostUserLikeStatus {
        return {
            postId: postLikeFound.id,
            myStatus: postLikeFound.likeStatus
        }
    }


    // async sortPosts(query: any, blogId?: BlogId): Promise<PostsSortViewModel> {
    //     const blogObjectId: ObjectId | null = blogId ? this._toIdQuery(blogId)._id : null
    //     const findFilter = blogObjectId ? {blogId: blogObjectId} : {}
    //
    //     const filter: PostsQueryDbType = {
    //         sortBy: query.sortBy ? query.sortBy : 'createdAt',
    //         sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    //         countSkips: query.pageNumber ? (query.pageNumber - 1) * query.pageSize : 0,
    //         pageSize: query.pageSize ? query.pageSize : 10
    //     }
    //     const posts = await postCollection
    //         .find(findFilter)
    //         .sort(filter.sortBy, filter.sortDirection)
    //         .skip(filter.countSkips)
    //         .limit(filter.pageSize)
    //         .toArray()
    //
    //     const totalPosts = await postCollection.countDocuments(findFilter)
    //     const pagesCount = Math.ceil(totalPosts / filter.pageSize)
    //
    //     return {
    //         pagesCount: pagesCount,
    //         page: query.pageNumber,
    //         pageSize: filter.pageSize,
    //         totalCount: totalPosts,
    //         items: posts.map(post => this._mapToPostViewModel(post))
    //     }
    // },
}