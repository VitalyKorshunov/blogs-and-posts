import {Router} from 'express'
import {
    commentCollection, PostModel,
    rateLimitCollection,
    securityCollection,
} from '../../db/mongo-db'
import {routersPaths} from '../../common/path/paths';
import {UserModel} from '../../domain/UsersEntity';
import {BlogModel} from '../../domain/BlogsEntity';

export const testingRouter = Router()

testingRouter.delete(routersPaths.testing.allData, async (req, res) => {
    await BlogModel.deleteMany({})
    await PostModel.deleteMany({})
    await UserModel.deleteMany({})
    await commentCollection.deleteMany({})
    await rateLimitCollection.deleteMany({})
    await securityCollection.deleteMany({})
    res.status(204).json({})
})