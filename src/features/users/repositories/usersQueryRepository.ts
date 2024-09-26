import {userCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType,} from '../../../db/query-db-type';
import {UserDbType, UsersQueryDbType} from '../../../db/user-db-type';
import {UserId, UsersSortViewModel, UserViewModel} from '../../../input-output-types/users-types';

export const usersQueryRepository = {
    _getValidQueryId(id: UserId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    map(user: UserDbType) {
        const userForOutput: UserViewModel = {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        }
        return userForOutput
    },

    async find(userId: UserId): Promise<UserDbType | null> {
        return await userCollection.findOne(this._getValidQueryId(userId))
    },
    async findAndMap(userId: UserId): Promise<UserViewModel> {
        const user: UserDbType | null = await this.find(userId)

        if (user) {
            return this.map(user)
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

        const users = await userCollection
            .find({
                $or: findFilter
            })
            .sort(filter.sortBy, filter.sortDirection)
            .skip(filter.countSkips)
            .limit(filter.pageSize)
            .toArray()

        const totalUsers = await userCollection.countDocuments({
            $or: findFilter
        })
        const pagesCount = Math.ceil(totalUsers / filter.pageSize)

        return {
            pagesCount: pagesCount,
            page: query.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalUsers,
            items: users.map(user => this.map(user))
        }
    },
}