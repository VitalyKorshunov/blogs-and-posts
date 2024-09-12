import {PostDbType} from '../../../db/post-db-type'
import {postCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType, SortQueryDbType} from '../../../db/query-db-type';
import {PostId} from '../../../input-output-types/posts-types';
import {BlogId} from '../../../input-output-types/blogs-types';

export const postsQueryRepository = {
    getValidQueryId(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    async find(id: PostId): Promise<PostDbType | null> {
        return await postCollection.findOne(this.getValidQueryId(id))
    },

    async getAll(): Promise<PostDbType[]> {
        return await postCollection.find({}).toArray()
    },
    async filterBlogPost(query: SortQueryDbType, id: BlogId): Promise<PostDbType[]> {
        // todo: Доработать
        const _id = this.getValidQueryId(id)

        return await postCollection
            .find({blogId: id})
            .sort({[query.sortBy]: query.sortDirection.includes('asc') ? 1 : -1})
            .skip(query.countSkips)
            .limit(query.pageSize).toArray() as PostDbType[]
    },

    async filterPosts(query: SortQueryDbType): Promise<PostDbType[]> {
        // todo: Доработать

        return await postCollection
            .find({})
            .sort({[query.sortBy]: query.sortDirection.includes('asc') ? 1 : -1})
            .skip(query.countSkips)
            .limit(query.pageSize).toArray() as PostDbType[]
    },
    async totalPosts(id?: BlogId | undefined): Promise<number> {
        const sortByField = id ? {blogId: id} : {}
        return await postCollection.countDocuments(sortByField)
    }
}
