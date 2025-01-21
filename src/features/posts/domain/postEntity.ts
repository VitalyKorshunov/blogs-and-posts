import mongoose, {HydratedDocument, Model, Schema} from 'mongoose';
import {SETTINGS} from '../../../settings';
import {
    CountPostsLikesAndDislikes,
    LikesAndDislikesPostsInfoDbType,
    PostDbType,
    PostsUserLikeStatusInfoDbType
} from '../../../types/db/post-db-types';
import {ObjectId} from 'mongodb';
import {LastNewestLikes, LikesAndDislikesCount} from '../../../types/entities/likes-types';

export interface PostMethodsType {
    getId(): string

    updatePost(title: string, shortDescription: string, content: string, blogId: string, blogName: string): void

    updateLikesInfo(likesAndDislikesCount: LikesAndDislikesCount, lastThreeNewestLikes: LastNewestLikes[]): void
}

export type HydratedPostType = HydratedDocument<PostDbType, PostMethodsType>

export interface PostModelType extends Model<PostDbType, {}, PostMethodsType> {
    createPost(title: string, content: string, shortDescription: string, blogId: string, blogName: string): HydratedPostType
}

const countPostsLikesAndDislikesSchema = new mongoose.Schema<CountPostsLikesAndDislikes>({
        likesCount: {type: Number, required: true, default: 0},
        dislikesCount: {type: Number, required: true, default: 0},
    },
    {_id: false})

const postsUserLikeStatusInfoSchema = new mongoose.Schema<PostsUserLikeStatusInfoDbType>({
        userId: {type: String, required: true},
        login: {type: String, required: true},
        addedAt: {type: String, required: true}
    },
    {_id: false})

const likesAndDislikesInfoSchema = new mongoose.Schema<LikesAndDislikesPostsInfoDbType>({
        countPostsLikesAndDislikes: {type: countPostsLikesAndDislikesSchema},
        postsUserLikeStatusInfo: {type: [postsUserLikeStatusInfoSchema], required: true, default: []}
    },
    {_id: false})

const postSchema = new mongoose.Schema<PostDbType, PostModelType, PostMethodsType>({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: Schema.Types.ObjectId, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: Date, required: true},
    likesAndDislikesInfo: {type: likesAndDislikesInfoSchema}
})
postSchema.method('getId', function getId(): string {
    return this.id
})
postSchema.method('updatePost', function updatePost(title: string, shortDescription: string, content: string, blogId: string, blogName: string): void {
    this.title = title
    this.shortDescription = shortDescription
    this.content = content
    this.blogId = new ObjectId(blogId)
    this.blogName = blogName
})
postSchema.method('updateLikesInfo', function updateLikesInfo(likesAndDislikesCount: LikesAndDislikesCount, lastThreeNewestLikes: LastNewestLikes[]): void {
    console.log('from postSchema before', lastThreeNewestLikes)
    const sortedLastThreeNewestLikes = lastThreeNewestLikes.sort((info1, info2) => new Date(info2.addedAt).getTime() - new Date(info1.addedAt).getTime())
    console.log('from postSchema after', sortedLastThreeNewestLikes)

    this.likesAndDislikesInfo.postsUserLikeStatusInfo = sortedLastThreeNewestLikes.slice(0, 3)

    this.likesAndDislikesInfo.countPostsLikesAndDislikes.likesCount = likesAndDislikesCount.likesCount
    this.likesAndDislikesInfo.countPostsLikesAndDislikes.dislikesCount = likesAndDislikesCount.dislikesCount
})
postSchema.static('createPost', function createPost(title: string, content: string, shortDescription: string, blogId: string, blogName: string): HydratedPostType {
    return new PostModel({
        title,
        content,
        shortDescription,
        blogId,
        blogName,
        createdAt: new Date(),
        likesAndDislikesInfo: {
            countPostsLikesAndDislikes: {
                likesCount: 0,
                dislikesCount: 0,
            },
            postsUserLikeStatusInfo: []
        }
    })
})
export const PostModel = mongoose.model<PostDbType, PostModelType>(SETTINGS.DB.POST_COLLECTION_NAME, postSchema)