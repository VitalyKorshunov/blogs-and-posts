import {SecurityViewModel} from '../../../types/entities/security-types';
import {SecurityDbType} from '../../../types/db/security-db-types';
import {ObjectId, WithId} from 'mongodb';
import {UserId} from '../../../types/entities/users-types';
import {injectable} from 'inversify';
import {HydratedSecurityType, SecurityModel} from '../domain/securityEntity';

@injectable()
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
        const sessions: HydratedSecurityType[] = await SecurityModel.find({userId: new ObjectId(userId)})

        if (!sessions.length) return null

        const filteredSession: HydratedSecurityType[] = sessions.filter((session) => {
            return session.expireDate > new Date()
        })

        return filteredSession.map(session => this.mapToSecurityViewModel(session))
    }
}