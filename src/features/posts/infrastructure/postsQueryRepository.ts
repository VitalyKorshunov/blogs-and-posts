import {PostDbType, PostsQueryDbType} from '../../../types/db/post-db-types'
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType,} from '../../../types/db/query-db-types';
import {PostId, PostsSortViewModel, PostViewModel} from '../../../types/entities/posts-types';
import {sortQueryFieldsUtils} from '../../../common/utils/sortQueryFields.utils';
import {SortOutputQueryType} from '../../../types/utils/sort-types';
import {injectable} from 'inversify';
import {PostModel} from '../domain/postEntity';

@injectable()
export class PostsQueryRepository {
    private toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    private mapToPostViewModel(post: WithId<PostDbType>): PostViewModel {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString()
        }
    }

    async isPostFound(id: PostId): Promise<boolean> {
        const post: number = await PostModel.countDocuments(this.toIdQuery(id));

        return !!post
    }

    async findPostById(postId: PostId): Promise<PostViewModel> {
        const post: WithId<PostDbType> | null = await PostModel.findOne(this.toIdQuery(postId))

        if (post) {
            return this.mapToPostViewModel(post)
        } else {
            throw new Error('post not found (postsQueryRepository.findAndMap)')
        }
    }

    async getAllSortedPosts(query: any): Promise<PostsSortViewModel> {
        const queryFindAllPosts = {}

        const sortedQueryFields: SortOutputQueryType = sortQueryFieldsUtils(query)
        const filter: PostsQueryDbType = {
            ...sortedQueryFields,
        }

        const posts: WithId<PostDbType>[] = await PostModel
            .find(queryFindAllPosts)
            .sort({[filter.sortBy]: filter.sortDirection})
            .skip(filter.countSkips)
            .limit(filter.pageSize)

        const totalPostsCount = await PostModel.countDocuments(queryFindAllPosts)
        const pagesCount = Math.ceil(totalPostsCount / filter.pageSize)

        return {
            pagesCount: pagesCount,
            page: filter.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalPostsCount,
            items: posts.map(post => this.mapToPostViewModel(post))
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