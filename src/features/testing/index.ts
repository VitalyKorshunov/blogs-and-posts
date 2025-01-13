import {Router} from 'express'
import {commentCollection, rateLimitCollection,} from '../../db/mongo-db'
import {routersPaths} from '../../common/path/paths';
import {UserModel} from '../users/domain/usersEntity';
import {BlogModel} from '../blogs/domain/blogEntity';
import {PostModel} from '../posts/domain/postEntity';
import {SecurityModel} from '../security/domain/securityEntity';

export const testingRouter = Router()

testingRouter.delete(routersPaths.testing.allData, async (req, res) => {
    await BlogModel.deleteMany({})
    await PostModel.deleteMany({})
    await UserModel.deleteMany({})
    await commentCollection.deleteMany({})
    await rateLimitCollection.deleteMany({})
    await SecurityModel.deleteMany({})
    res.status(204).json({})
})