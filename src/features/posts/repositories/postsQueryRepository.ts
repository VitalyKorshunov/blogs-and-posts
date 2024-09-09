import {PostDbType} from '../../../db/post-db-type'
import {postCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';
import {PostId} from '../../../input-output-types/posts-types';

export const postsQueryRepository = {
    getValidQueryId(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    async find(id: PostId): Promise<PostDbType | null> {
        return await postCollection.findOne(this.getValidQueryId(id))
    },

    async getAll(): Promise<PostDbType[]> {
        return await postCollection.find({}).toArray()
    }
}