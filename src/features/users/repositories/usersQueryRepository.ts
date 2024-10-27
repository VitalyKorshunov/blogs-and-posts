import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType,} from '../../../types/db/query-db-types';
import {UserDbType, UsersQueryDbType} from '../../../types/db/user-db-types';
import {UserId, UsersSortViewModel, UserViewModel} from '../../../types/entities/users-types';
import {UserModel} from '../../../db/mongo-db';

export const usersQueryRepository = {
    _toIdQuery(id: UserId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToUserViewModel(user: WithId<UserDbType>) {
        const userForOutput: UserViewModel = {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt.toISOString()
        }
        return userForOutput
    },


    async isUserFound(id: UserId): Promise<boolean> {
        const user: number = await UserModel.countDocuments(this._toIdQuery(id));

        return !!user
    },
    async findAndMap(userId: UserId): Promise<UserViewModel> {
        const user: WithId<UserDbType> | null = await UserModel.findOne(this._toIdQuery(userId))

        if (user) {
            return this._mapToUserViewModel(user)
        } else {
            throw new Error('user not found (usersQueryRepository.findAndMap)')
        }
    },
    async getAll(query: any): Promise<UsersSortViewModel> {
        return await this.sortUsers(query)
    },
    async sortUsers(query: any): Promise<UsersSortViewModel> {
        const filter: UsersQueryDbType = {
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection : 'desc',
            countSkips: query.pageNumber ? (query.pageNumber - 1) * query.pageSize : 0,
            pageSize: query.pageSize ? query.pageSize : 10,
            searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : null,
            searchEmailTerm: query.searchEmailTerm ? query.searchEmailTerm : null,
        }

        const findLoginFilter = filter.searchLoginTerm
            ? {login: {$regex: query.searchLoginTerm, $options: 'i'}}
            : null
        const findEmailFilter = filter.searchEmailTerm
            ? {email: {$regex: filter.searchEmailTerm, $options: 'i'}}
            : null;

        const findFilter = []
        if (findLoginFilter) findFilter.push(findLoginFilter);
        if (findEmailFilter) findFilter.push(findEmailFilter);
        if (findFilter.length === 0) findFilter.push({});

        const users = await UserModel
            .find({
                $or: findFilter
            })
            .sort({[filter.sortBy]: filter.sortDirection})
            .skip(filter.countSkips)
            .limit(filter.pageSize)

        const totalUsers = await UserModel.countDocuments({
            $or: findFilter
        })
        const pagesCount = Math.ceil(totalUsers / filter.pageSize)

        return {
            pagesCount: pagesCount,
            page: query.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalUsers,
            items: users.map(user => this._mapToUserViewModel(user))
        }
    },
}
