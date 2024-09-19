import {Router} from 'express'
import {blogCollection, postCollection, userCollection} from '../../db/mongo-db'

export const testingRouter = Router()

testingRouter.delete('/all-data', async (req, res) => {
    await blogCollection.drop()
    await postCollection.drop()
    await userCollection.drop()
    res.status(204).json({})
})