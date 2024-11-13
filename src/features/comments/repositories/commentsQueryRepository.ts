import {commentCollection} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType,} from '../../../types/db/query-db-types';
import {PostId} from '../../../types/entities/posts-types';
import {
    CommentId,
    CommentsSortViewModel,
    CommentUserLikeStatus,
    CommentViewModel
} from '../../../types/entities/comments-types';
import {
    CommentDbType,
    CommentsQueryDbType,
    CommentUserLikeStatusInfoDbType,
    LikeStatus
} from '../../../types/db/comments-db-types';
import {UserId} from '../../../types/entities/users-types';

export class CommentsQueryRepository {
    private toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    private mapToCommentUserInfoWithCorrectId(commentUserInfo: CommentUserLikeStatusInfoDbType): CommentUserLikeStatus {
        return {
            myStatus: commentUserInfo.likeStatus
        }
    }

    private mapToCommentViewModel(comment: WithId<CommentDbType>, commentUserLikeStatus: CommentUserLikeStatus): CommentViewModel {
        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId.toString(),
                userLogin: comment.commentatorInfo.userLogin,
            },
            createdAt: comment.createdAt.toISOString(),
            likesInfo:
                {
                    likesCount: comment.likesAndDislikesInfo.countCommentLikesAndDislikes.likesCount,
                    dislikesCount: comment.likesAndDislikesInfo.countCommentLikesAndDislikes.dislikesCount,
                    myStatus: commentUserLikeStatus.myStatus
                }
        }
    }

    async isCommentFound(id: CommentId): Promise<boolean> {
        const comment: number = await commentCollection.countDocuments(this.toIdQuery(id));

        return !!comment
    }

    async findUserLikeStatusForComment(commentId: CommentId, userId: UserId): Promise<CommentUserLikeStatus | null> {
        const userInfo = await commentCollection.findOne(
            {
                ...this.toIdQuery(commentId),
                'likesAndDislikesInfo.commentUserLikeStatusInfo.userId': new ObjectId(userId)
            },
            {
                projection: {
                    'likesAndDislikesInfo.commentUserLikeStatusInfo.$': 1,
                    _id: 0,
                }
            })
        console.log(userInfo)
        return userInfo ? this.mapToCommentUserInfoWithCorrectId(userInfo.likesAndDislikesInfo.commentUserLikeStatusInfo[0]) : null
    }

    async findAndMap(commentId: CommentId, userId: UserId | null): Promise<CommentViewModel> {
        const comment: WithId<CommentDbType> | null = await commentCollection.findOne(this.toIdQuery(commentId), {
            projection: {
                'likesAndDislikesInfo.commentUserLikeStatusInfo': 0,
            }
        })

        const userLikeStatus: CommentUserLikeStatus =
            userId
                ? await this.findUserLikeStatusForComment(commentId, userId) ?? {myStatus: LikeStatus.None}
                : {myStatus: LikeStatus.None}

        if (comment) {
            return this.mapToCommentViewModel(comment, userLikeStatus)
        } else {
            throw new Error('comment not found (commentsQueryRepository.findAndMap)')
        }
    }

    async getAll(postId: PostId, query: any, userId: UserId | null): Promise<CommentsSortViewModel> {
        return await this.sortComments(postId, query, userId)
    }

    async sortComments(postId: PostId, query: any, userId: UserId | null): Promise<CommentsSortViewModel> {
        const postObjectId: ObjectId = this.toIdQuery(postId)._id
        const findFilter = {postId: postObjectId}

        const filter: CommentsQueryDbType = {
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection : 'desc',
            countSkips: query.pageNumber ? (query.pageNumber - 1) * query.pageSize : 0,
            pageSize: query.pageSize ? query.pageSize : 10
        }
        const comments: WithId<CommentDbType>[] = await commentCollection
            .find(findFilter)
            .sort(filter.sortBy, filter.sortDirection)
            .skip(filter.countSkips)
            .limit(filter.pageSize)
            .toArray()

        const totalComments = await commentCollection.countDocuments(findFilter)
        const commentsCount = Math.ceil(totalComments / filter.pageSize)

        return {
            pagesCount: commentsCount,
            page: query.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalComments,
            items: await Promise.all(comments.map(async comment => {
                    const userLikeStatus: CommentUserLikeStatus =
                        userId
                            ? await this.findUserLikeStatusForComment(comment._id.toString(), userId) ?? {myStatus: LikeStatus.None}
                            : {myStatus: LikeStatus.None}

                    return this.mapToCommentViewModel(comment, userLikeStatus)
                })
            )
        }
    }
}

