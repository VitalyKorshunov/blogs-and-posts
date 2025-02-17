import mongoose, {HydratedDocument, Model} from 'mongoose';
import {BlogDbType} from '../../../types/db/blog-db-types';
import {SETTINGS} from '../../../settings';

export interface BlogMethodsType {
    getId(): string
    getName(): string
    update(name: string, description: string, websiteUrl: string): void
}

export type HydratedBlogType = HydratedDocument<BlogDbType, BlogMethodsType>

export interface BlogModelType extends Model<BlogDbType, {}, BlogMethodsType> {
    createBlog(name: string, description: string, websiteUrl: string): HydratedBlogType
}

const blogSchema = new mongoose.Schema<BlogDbType, BlogModelType, BlogMethodsType>({
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: Date, required: true},
    isMembership: {type: Boolean, required: true}
})

blogSchema.method('getId', function getId(): string {
    return this.id
})
blogSchema.method('getName', function getName(): string {
    return this.name
})
blogSchema.method('update', function update(name: string, description: string, websiteUrl: string): void {
    this.name = name
    this.description = description
    this.websiteUrl = websiteUrl
})

blogSchema.static('createBlog', function createBlog(name: string, description: string, websiteUrl: string) {
    return new BlogModel({
        name,
        description,
        websiteUrl,
        createdAt: new Date(),
        isMembership: false
    })
})

export const BlogModel = mongoose.model<BlogDbType, BlogModelType>(SETTINGS.DB.BLOG_COLLECTION_NAME, blogSchema)