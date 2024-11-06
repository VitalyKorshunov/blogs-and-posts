import {commentCollection} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType,} from '../../../types/db/query-db-types';
import {PostId} from '../../../types/entities/posts-types';
import {CommentId, CommentsSortViewModel, CommentViewModel} from '../../../types/entities/comments-types';
import {CommentDbType, CommentsQueryDbType} from '../../../types/db/comments-db-types';

class CommentsQueryRepository {
    private toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    private mapToCommentViewModel(comment: WithId<CommentDbType>): CommentViewModel {
        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId.toString(),
                userLogin: comment.commentatorInfo.userLogin,
            },
            createdAt: comment.createdAt.toISOString()
        }
    }

    async isCommentFound(id: CommentId): Promise<boolean> {
        const comment: number = await commentCollection.countDocuments(this.toIdQuery(id));

        return !!comment
    }

    async findAndMap(commentId: CommentId): Promise<CommentViewModel> {
        const comment: WithId<CommentDbType> | null = await commentCollection.findOne(this.toIdQuery(commentId))

        if (comment) {
            return this.mapToCommentViewModel(comment)
        } else {
            throw new Error('comment not found (commentsQueryRepository.findAndMap)')
        }
    }

    async getAll(postId: PostId, query: any,): Promise<CommentsSortViewModel> {
        return await this.sortComments(postId, query)
    }

    async sortComments(postId: PostId, query: any,): Promise<CommentsSortViewModel> {
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
            items: comments.map(comment => this.mapToCommentViewModel(comment))
        }
    }
}

export const commentsQueryRepository = new CommentsQueryRepository()
