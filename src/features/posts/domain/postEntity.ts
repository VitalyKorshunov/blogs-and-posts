import mongoose, {HydratedDocument, Model, Schema} from 'mongoose';
import {SETTINGS} from '../../../settings';
import {PostDbType} from '../../../types/db/post-db-types';
import {ObjectId} from 'mongodb';

export interface PostMethodsType {
    getId(): string

    update(title: string, shortDescription: string, content: string, blogId: string, blogName: string): void
}

export type HydratedPostType = HydratedDocument<PostDbType, PostMethodsType>

export interface PostModelType extends Model<PostDbType, {}, PostMethodsType> {
    createPost(title: string, content: string, shortDescription: string, blogId: string, blogName: string): HydratedPostType
}

const postSchema = new mongoose.Schema<PostDbType, PostModelType, PostMethodsType>({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: Schema.Types.ObjectId, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: Date, required: true}
})
postSchema.method('getId', function getId(): string {
    return this.id
})
postSchema.method('update', function update(title: string, shortDescription: string, content: string, blogId: string, blogName: string): void {
    this.title = title
    this.shortDescription = shortDescription
    this.content = content
    this.blogId = new ObjectId(blogId)
    this.blogName = blogName
})
postSchema.static('createPost', function createPost(title: string, content: string, shortDescription: string, blogId: string, blogName: string): HydratedPostType {
    return new PostModel({
        title,
        content,
        shortDescription,
        blogId,
        blogName,
        createdAt: new Date()
    })
})
export const PostModel = mongoose.model<PostDbType, PostModelType>(SETTINGS.DB.POST_COLLECTION_NAME, postSchema)