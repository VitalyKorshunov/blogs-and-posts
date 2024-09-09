import {PostId, PostInputModel} from '../../../input-output-types/posts-types'
import {PostDbType} from '../../../db/post-db-type'
import {postCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';

export const postsRepository = {
    getValidQueryId(id: string): IdQueryDbType  {
        return {_id: new ObjectId(id)}
    },

    async create(post: PostDbType): Promise<PostId> {
        const _id = await postCollection.insertOne(post)

        return _id.insertedId.toString()
    },
    async del(id: string): Promise<number> {
        const post = await postCollection.deleteOne(this.getValidQueryId(id))

        return post.deletedCount
    },
    async put(post: PostInputModel, id: PostId): Promise<number> {
        //todo: Типизация PostInputModel
        const postUpdated = await postCollection.updateOne(this.getValidQueryId(id), {$set: post})

        return postUpdated.modifiedCount
    },
}