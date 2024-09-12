import {BlogDbType} from '../../../db/blog-db-type'
import {blogCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';
import {BlogId} from '../../../input-output-types/blogs-types';

export const blogsQueryRepository = {
    getValidQueryId(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    async find(id: BlogId): Promise<BlogDbType | null> {
        return await blogCollection.findOne(this.getValidQueryId(id));
    },
    async getAll(paginatedQuery: any = '', term: string = ''): Promise</*BlogViewModel*/BlogDbType[]> {
        const filter = {
            name: term
        }
        // const blogs = blogCollection.find(filter).toArray()

        return await blogCollection.find({}).toArray()
    }
}