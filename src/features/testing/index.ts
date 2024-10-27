import {Router} from 'express'
import {
    BlogModel,
    commentCollection, PostModel,
    rateLimitCollection,
    securityCollection, UserModel,
} from '../../db/mongo-db'
import {routersPaths} from '../../common/path/paths';

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