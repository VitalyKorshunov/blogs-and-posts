import {SecurityViewModel} from '../../../types/entities/security-types';
import {SecurityDbType} from '../../../types/db/security-db-types';
import {ObjectId, WithId} from 'mongodb';
import {UserId} from '../../../types/entities/users-types';
import {securityCollection} from '../../../db/mongo-db';

export class SecurityQueryRepository {
    private mapToSecurityViewModel(data: WithId<SecurityDbType>): SecurityViewModel {
        return {
            ip: data.ip,
            title: data.deviceName,
            lastActiveDate: data.lastActiveDate.toISOString(),
            deviceId: data.deviceId
        }
    }

    async getAllActiveSessionsByUser(userId: UserId): Promise<SecurityViewModel[] | null> {
        const sessions: WithId<SecurityDbType>[] = await securityCollection.find({userId: new ObjectId(userId)}).toArray()

        if (!sessions) return null

        const filteredSession: WithId<SecurityDbType>[] = sessions.filter((session) => {
            return session.expireDate > new Date()
        })

        return filteredSession.map(session => this.mapToSecurityViewModel(session))
    }
}