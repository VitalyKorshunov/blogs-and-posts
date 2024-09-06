import {Router} from 'express'
import {blogCollection, db, postCollection} from '../../db/mongo-db'

export const testingRouter = Router()

testingRouter.delete('/all-data', async (req, res) => {
    await blogCollection.drop()
    await postCollection.drop()
    res.status(204).json({})
})