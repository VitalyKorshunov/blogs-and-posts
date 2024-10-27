import {PostCreateType, PostId, PostServiceModel, PostUpdateType} from '../../../types/entities/posts-types'
import {PostDbType, PostUpdateDbType} from '../../../types/db/post-db-types'
import {BlogModel, PostModel} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {BlogId, BlogServiceModel} from '../../../types/entities/blogs-types';
import {BlogDbType} from '../../../types/db/blog-db-types';

export const postsRepository = {
    _toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToPostWithCorrectId(post: WithId<PostDbType>): PostServiceModel {
        const {_id, blogId, ...rest} = post
        return {
            id: _id.toString(),
            blogId: blogId.toString(),
            ...rest
        }
    },
    _mapToBlogWithCorrectId(blog: WithId<BlogDbType>): BlogServiceModel {
        const {_id, ...rest} = blog
        return {
            id: _id.toString(),
            ...rest
        }
    },


    async createPost(post: PostCreateType): Promise<PostId> {
        const postToDb: PostDbType = {
            ...post,
            blogId: new ObjectId(post.blogId)
        }
        const _id = await PostModel.insertMany([postToDb])

        return _id[0]._id.toString()
    },
    async deletePost(postId: PostId): Promise<number> {
        const post = await PostModel.deleteOne(this._toIdQuery(postId))

        return post.deletedCount
    },
    async updatePost(post: PostUpdateType, postId: PostId): Promise<number> {
        const blogId: ObjectId = this._toIdQuery(post.blogId)._id
        const updatedPost: PostUpdateDbType = {...post, blogId: blogId}

        const postUpdated = await PostModel.updateOne(this._toIdQuery(postId), {$set: updatedPost})

        return postUpdated.modifiedCount
    },

    async findBlogById(id: BlogId): Promise<BlogServiceModel | null> {
        const blog: WithId<BlogDbType> | null = await BlogModel.findById(id).lean();

        return blog ? this._mapToBlogWithCorrectId(blog) : null
    },
}