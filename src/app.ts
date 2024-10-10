import express from 'express'
import cors from 'cors'
import {SETTINGS} from './settings'
import {blogsRouter} from './features/blogs'
import {testingRouter} from './features/testing'
import {postsRouter} from './features/posts'
import {usersRouter} from './features/users';
import {authRouter} from './features/auth';
import {commentsRouter} from './features/comments';
import cookieParser from 'cookie-parser';

export const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser('secret'))

app.get('/', (req, res) => {
    res.status(200).json({version: '1.7.0'})
})


app.use(SETTINGS.PATH.AUTH, authRouter)
app.use(SETTINGS.PATH.BLOGS, blogsRouter)
app.use(SETTINGS.PATH.POSTS, postsRouter)
app.use(SETTINGS.PATH.USERS, usersRouter)
app.use(SETTINGS.PATH.COMMENTS, commentsRouter)
app.use(SETTINGS.PATH.TESTING, testingRouter)