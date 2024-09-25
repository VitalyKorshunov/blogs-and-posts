import {PostId, UpdatePostType} from '../../../input-output-types/posts-types'
import {
    PostDbInputType,
    PostDbOutputType,
    PostDbWithCorrectIdType,
    PostMongoDbInputType,
    UpdatePostDbType
} from '../../../db/post-db-type'
import {postCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';

export const postsRepository = {
    _getValidQueryId(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToPostWithCorrectId(post: PostDbOutputType): PostDbWithCorrectIdType {
        const {_id, blogId, ...rest} = post
        return {
            id: _id.toString(),
            blogId: blogId.toString(),
            ...rest
        }
    },


    async create(post: PostDbInputType): Promise<PostId> {
        const postToDb: PostMongoDbInputType = {
            ...post,
            blogId: new ObjectId(post.blogId)
        }
        const _id = await postCollection.insertOne(postToDb)

        return _id.insertedId.toString()
    },
    async find(id: PostId): Promise<PostDbWithCorrectIdType | null> {
        const post: PostDbOutputType | null = await postCollection.findOne(this._getValidQueryId(id));

        return post ? this._mapToPostWithCorrectId(post) : null
    },
    async del(postId: PostId): Promise<number> {
        const post = await postCollection.deleteOne(this._getValidQueryId(postId))

        return post.deletedCount
    },
    async put(post: UpdatePostType, postId: PostId): Promise<number> {
        const blogId: ObjectId = this._getValidQueryId(post.blogId)._id
        const updatedPost: UpdatePostDbType = {...post, blogId: blogId}

        const postUpdated = await postCollection.updateOne(this._getValidQueryId(postId), {$set: updatedPost})

        return postUpdated.modifiedCount
    },
}