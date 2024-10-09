import {Router} from 'express'
import {blogCollection, commentCollection, postCollection, userCollection} from '../../db/mongo-db'
import {routersPaths} from '../../common/path/paths';

export const testingRouter = Router()

testingRouter.delete(routersPaths.testing.allData, async (req, res) => {
    await blogCollection.drop()

    res.status(204).json({})
})