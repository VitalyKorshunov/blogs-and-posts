import {BlogInputModel} from './entities/blogs-types'
import {PostInputModel} from './entities/posts-types'

export type FieldNamesType = keyof BlogInputModel | keyof PostInputModel
// const f: FieldsType = 'some' // error

export type OutputErrorsType = {
    errorsMessages: {message: string, field: FieldNamesType}[]
}

export type ErrorsType = {
    errorsMessages: {
        field: string
        message: string
    }[]
}