import {PostCreateType, PostId, PostServiceModel, PostUpdateType} from '../../../types/entities/posts-types'
import {PostDbType, PostUpdateDbType} from '../../../types/db/post-db-types'
import {BlogModel, PostModel} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {BlogId, BlogServiceModel} from '../../../types/entities/blogs-types';
import {BlogDbType} from '../../../types/db/blog-db-types';

export class PostsRepository {
    private toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    private mapToPostWithCorrectId(post: WithId<PostDbType>): PostServiceModel {
        const {_id, blogId, ...rest} = post
        return {
            id: _id.toString(),
            blogId: blogId.toString(),
            ...rest
        }
    }

    private mapToBlogWithCorrectId(blog: WithId<BlogDbType>): BlogServiceModel {
        const {_id, ...rest} = blog
        return {
            id: _id.toString(),
            ...rest
        }
    }

    async createPost(post: PostCreateType): Promise<PostId> {
        const postToDb: PostDbType = {
            ...post,
            likesAndDislikesInfo: {
                countPostsLikesAndDislikes: {
                    likesCount: 0,
                    dislikesCount: 0
                },
                postsUserLikeStatusInfo: []
            },
            blogId: new ObjectId(post.blogId)
        }
        const createdPost = new PostModel(postToDb)
        await createdPost.save()

        return createdPost._id.toString()
    }

    async deletePost(postId: PostId): Promise<number> {
        const post = await PostModel.deleteOne(this.toIdQuery(postId))

        return post.deletedCount
    }

    async updatePost(post: PostUpdateType, postId: PostId): Promise<number> {
        const blogId: ObjectId = this.toIdQuery(post.blogId)._id
        const updatedPost: PostUpdateDbType = {...post, blogId: blogId}

        const postUpdated = await PostModel.updateOne(this.toIdQuery(postId), {$set: updatedPost})

        return postUpdated.modifiedCount
    }

    async findBlogById(id: BlogId): Promise<BlogServiceModel | null> {
        const blog: WithId<BlogDbType> | null = await BlogModel.findById(id).lean();

        return blog ? this.mapToBlogWithCorrectId(blog) : null
    }
}