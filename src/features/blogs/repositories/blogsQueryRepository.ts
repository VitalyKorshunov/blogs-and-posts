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
        //todo Как тут лучше было бы написать типизацию? С null или без?

        return await blogCollection.findOne(this.getValidQueryId(id));
    },
    async getAll(): Promise<BlogDbType[]> {
        //todo: Какой способ поиска и фильтрации предпочтительней:
        // 1). find({_id: id}, {field: true, ...etc})
        // 2). findOne({_id: id}) и затем маппинг

        return await blogCollection.find({}).toArray()
    }
}