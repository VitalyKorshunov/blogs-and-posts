import {Router} from 'express'
import {
    blogCollection,
    commentCollection,
    postCollection,
    rateLimitCollection,
    securityCollection,
    userCollection
} from '../../db/mongo-db'
import {routersPaths} from '../../common/path/paths';

export const testingRouter = Router()

testingRouter.delete(routersPaths.testing.allData, async (req, res) => {
    await blogCollection.deleteMany({})
    await postCollection.deleteMany({})
    await userCollection.deleteMany({})
    await commentCollection.deleteMany({})
    await rateLimitCollection.deleteMany({})
    await securityCollection.deleteMany({})
    res.status(204).json({})
})