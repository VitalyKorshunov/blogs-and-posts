import {PostInputModel} from '../../../input-output-types/posts-types'
import {PostDbType} from '../../../db/post-db-type'
import {postCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';

export const postsRepository = {
    getValidQueryId(id: string): IdQueryDbType  {
        return {_id: new ObjectId(id)}
    },

    async create(post: PostDbType): Promise<string> {
        const _id = await postCollection.insertOne(post)

        return _id.insertedId.toString()
    },
    // async find(id: string): Promise<PostDbType> {
    //     return await postCollection.findOne(this.getValidQueryId(id)) as PostDbType
    // },
    // async findAndMap(id: string): Promise<PostViewModel> {
    //     const post = await this.find(id)
    //     return this.map(post)
    // },
    // async getAll(): Promise<PostViewModel[]> {
    //     const posts: PostDbType[] = await postCollection.find({}).toArray()
    //
    //     return posts.map((post) => this.map(post))
    // },
    async del(id: string): Promise<number> {
        const post = await postCollection.deleteOne(this.getValidQueryId(id))

        return post.deletedCount
    },
    async put(post: PostInputModel, id: string): Promise<number> {
        //todo: Типизация PostInputModel
        const postUpdated = await postCollection.updateOne(this.getValidQueryId(id), {$set: post})

        return postUpdated.modifiedCount
    },
    // map(post: PostDbType) {
    //     const postForOutput: PostViewModel = {
    //         id: post._id.toString(),
    //         title: post.title,
    //         shortDescription: post.shortDescription,
    //         content: post.content,
    //         blogId: post.blogId,
    //         blogName: post.blogName,
    //         createdAt: post.createdAt
    //     }
    //     return postForOutput
    // },
}