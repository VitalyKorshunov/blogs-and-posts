import {BlogInputModel} from './blogs-types'
import {PostInputModel} from './posts-types'

export type FieldNamesType = keyof BlogInputModel | keyof PostInputModel
// const f: FieldsType = 'some' // error

export type OutputErrorsType = {
    errorsMessages: {message: string, field: FieldNamesType}[]
}