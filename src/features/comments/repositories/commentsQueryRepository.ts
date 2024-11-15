import {commentCollection} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType,} from '../../../types/db/query-db-types';
import {PostId} from '../../../types/entities/posts-types';
import {
    CommentId,
    CommentIdWithCommentUserLikeStatus,
    CommentsSortViewModel,
    CommentViewModel
} from '../../../types/entities/comments-types';
import {
    CommentDbType,
    CommentIdWithUserLikeStatusDbType,
    CommentsQueryDbType,
    LikeStatus,
    OneOfLikeStatus
} from '../../../types/db/comments-db-types';
import {UserId} from '../../../types/entities/users-types';

export class CommentsQueryRepository {
    private toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    private mapToCommentUserInfoWithCorrectId(commentUserInfo: CommentIdWithUserLikeStatusDbType): CommentIdWithCommentUserLikeStatus {
        const commentId: CommentId = commentUserInfo._id.toString()
        const userLikeStatus: OneOfLikeStatus = commentUserInfo.likesAndDislikesInfo.commentUserLikeStatusInfo[0].likeStatus
        return {
            commentId: commentId,
            myStatus: userLikeStatus
        }
    }

    private mapToCommentViewModel(comment: WithId<CommentDbType>, commentIdWithCommentUserLikeStatus: CommentIdWithCommentUserLikeStatus): CommentViewModel {
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
                    myStatus: commentIdWithCommentUserLikeStatus.myStatus
                }
        }
    }

    async isCommentFound(id: CommentId): Promise<boolean> {
        const comment: number = await commentCollection.countDocuments(this.toIdQuery(id));

        return !!comment
    }

    async findUserLikeStatusForComments(commentIds: CommentId[], userId: UserId): Promise<CommentIdWithCommentUserLikeStatus[]> {
        const queryCommentIds = commentIds.map(id => new ObjectId(id))

        const userLikeStatusForComments = await commentCollection.find(
            {
                _id: {$in: queryCommentIds},
                'likesAndDislikesInfo.commentUserLikeStatusInfo.userId': new ObjectId(userId)
            },
            {
                projection: {
                    'likesAndDislikesInfo.commentUserLikeStatusInfo.$': 1
                }
            }).toArray()

        const result = commentIds.map(commentId => {
            const foundComment = userLikeStatusForComments.find(comment => comment._id.toString() === commentId)

            return foundComment
                ? this.mapToCommentUserInfoWithCorrectId(foundComment)
                : {commentId, myStatus: LikeStatus.None}
        })

        return result
    }

    async findCommentById(commentId: CommentId, userId: UserId | null): Promise<CommentViewModel> {
        const comment: WithId<CommentDbType> | null = await commentCollection.findOne(this.toIdQuery(commentId), {
            projection: {
                'likesAndDislikesInfo.commentUserLikeStatusInfo': 0,
            }
        })

        const userLikeStatus: CommentIdWithCommentUserLikeStatus[] =
            userId
                ? await this.findUserLikeStatusForComments([commentId], userId)
                : [{commentId, myStatus: LikeStatus.None}]

        if (comment) {
            return this.mapToCommentViewModel(comment, userLikeStatus[0])
        } else {
            throw new Error('comment not found (commentsQueryRepository.findAndMap)')
        }
    }

    async findAllCommentsForPost(postId: PostId, query: any, userId: UserId | null): Promise<CommentsSortViewModel> {

        const postObjectId: ObjectId = this.toIdQuery(postId)._id
        const findFilter = {postId: postObjectId}

        const filter: CommentsQueryDbType = {
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection : 'desc',
            countSkips: query.pageNumber ? (query.pageNumber - 1) * query.pageSize : 0,
            pageSize: query.pageSize ? query.pageSize : 10
        }
        const comments: WithId<CommentDbType>[] = await commentCollection
            .find(findFilter, {projection: {'likesAndDislikesInfo.commentUserLikeStatusInfo': 0}})
            .sort(filter.sortBy, filter.sortDirection)
            .skip(filter.countSkips)
            .limit(filter.pageSize)
            .toArray()

        const totalComments = await commentCollection.countDocuments(findFilter)
        const commentsCount = Math.ceil(totalComments / filter.pageSize)

        const commentIds: CommentId[] = comments.map(comment => comment._id.toString())

        const commentsWithUserLikeStatus: CommentIdWithCommentUserLikeStatus[] =
            userId
                ? await this.findUserLikeStatusForComments(commentIds, userId)
                : commentIds.map(commentId => ({commentId, myStatus: LikeStatus.None}))

        return {
            pagesCount: commentsCount,
            page: query.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalComments,
            items: comments.map(comment => {
                const foundLikeStatus = commentsWithUserLikeStatus.find(commentLikeStatus => commentLikeStatus.commentId === comment._id.toString()) ?? {
                    commentId: comment._id.toString(),
                    myStatus: LikeStatus.None
                }
                return this.mapToCommentViewModel(comment, foundLikeStatus)
            })
        }
    }
}

