import {PostInputModel, PostViewModel} from '../../input-output-types/posts-types'
import {PostDbType} from '../../db/post-db-type'
import {blogsRepository} from '../blogs/blogsRepositoryMongoDb'
import {postCollection} from '../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {BlogDbType} from '../../db/blog-db-type';
import {IdQueryDbType} from '../../db/query-db-type';

export const postsRepository = {
    async create(post: PostInputModel): Promise<string> {
        const blogName: BlogDbType = await blogsRepository.find(post.blogId) as BlogDbType;
        const newPost: PostDbType = {
            _id: new ObjectId(),
            title: post.title,
            content: post.content,
            shortDescription: post.shortDescription,
            blogId: post.blogId,
            blogName: blogName.name,
            createdAt: new Date().toISOString()
        }
        await postCollection.insertOne(newPost)
        return newPost._id.toString()
    },
    async find(id: string): Promise<PostDbType> {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}

        return await postCollection.findOne(queryId) as PostDbType
    },
    async findAndMap(id: string): Promise<PostViewModel> {
        const post = await this.find(id)
        return this.map(post!)
    },
    async getAll(): Promise<PostViewModel[]> {
        const posts: PostDbType[] = await postCollection.find({}).toArray()
        return posts.map((post) => this.map(post))
    },
    async del(id: string): Promise<number> {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}
        const post = await postCollection.deleteOne(queryId)

        return post.deletedCount
    },
    async put(post: PostInputModel, id: string): Promise<number> {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}

        const blog = await blogsRepository.find(post.blogId)

        const postUpdated = await postCollection.updateOne(queryId, {$set: {...post, blogName: blog!.name}})

        return postUpdated.modifiedCount
    },
    map(post: PostDbType) {
        const postForOutput: PostViewModel = {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt
        }
        return postForOutput
    },
}