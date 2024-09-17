import {PostId, UpdatePostType} from '../../../input-output-types/posts-types'
import {PostDbType, UpdatePostDbType} from '../../../db/post-db-type'
import {postCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';

export const postsRepository = {
    getValidQueryId(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },

    async create(post: PostDbType): Promise<PostId> {
        const _id = await postCollection.insertOne(post)

        return _id.insertedId.toString()
    },
    async del(postId: PostId): Promise<number> {
        const post = await postCollection.deleteOne(this.getValidQueryId(postId))

        return post.deletedCount
    },
    async put(post: UpdatePostType, postId: PostId): Promise<number> {
        const blogId: ObjectId = this.getValidQueryId(post.blogId)._id
        const updatedPost: UpdatePostDbType = {...post, blogId: blogId}

        const postUpdated = await postCollection.updateOne(this.getValidQueryId(postId), {$set: updatedPost})

        return postUpdated.modifiedCount
    },
}