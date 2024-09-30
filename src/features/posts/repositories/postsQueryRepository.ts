import {PostDbType, PostsQueryDbType} from '../../../types/db/post-db-types'
import {postCollection} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType,} from '../../../types/db/query-db-types';
import {PostId, PostsSortViewModel, PostViewModel} from '../../../types/entities/posts-types';
import {BlogId,} from '../../../types/entities/blogs-types';

export const postsQueryRepository = {
    _toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToPostViewModel(post: WithId<PostDbType>) {
        const postForOutput: PostViewModel = {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            createdAt: post.createdAt
        }
        return postForOutput
    },

    async isPostFound(id: PostId): Promise<boolean> {
        const post: number = await postCollection.countDocuments(this._toIdQuery(id));

        return !!post
    },
    async findAndMap(postId: PostId): Promise<PostViewModel> {
        const post: WithId<PostDbType> | null = await postCollection.findOne(this._toIdQuery(postId))

        if (post) {
            return this._mapToPostViewModel(post)
        } else {
            throw new Error('post not found (postsQueryRepository.findAndMap)')
        }
    },
    async getAll(query: any): Promise<PostsSortViewModel> {
        return await this.sortPosts(query)
    },
    async sortPosts(query: any, blogId?: BlogId): Promise<PostsSortViewModel> {
        //todo: оставить универсальный метод для использования в blogsQueryRepository или продублировать его там же?
        // Универсальность достигнута с помощью необязательного blogId
        const blogObjectId: ObjectId | null = blogId ? this._toIdQuery(blogId)._id : null
        const findFilter = blogObjectId ? {blogId: blogObjectId} : {}

        const filter: PostsQueryDbType = {
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection : 'desc',
            countSkips: query.pageNumber ? (query.pageNumber - 1) * query.pageSize : 0,
            pageSize: query.pageSize ? query.pageSize : 10
        }
        const posts = await postCollection
            .find(findFilter)
            .sort(filter.sortBy, filter.sortDirection)
            .skip(filter.countSkips)
            .limit(filter.pageSize)
            .toArray()

        const totalPosts = await postCollection.countDocuments(findFilter)
        const pagesCount = Math.ceil(totalPosts / filter.pageSize)

        return {
            pagesCount: pagesCount,
            page: query.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalPosts,
            items: posts.map(post => this._mapToPostViewModel(post))
        }
    },
}
