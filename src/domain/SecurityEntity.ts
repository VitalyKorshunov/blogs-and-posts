import mongoose, {HydratedDocument, Model, Schema} from 'mongoose';
import {SETTINGS} from '../settings';
import {add} from 'date-fns';
import {v7 as uuidv7} from 'uuid';
import {SecurityDbType} from '../types/db/security-db-types';

export interface SecurityMethodsType {

}

export type HydratedSecurityType = HydratedDocument<SecurityDbType, SecurityMethodsType>

export interface SecurityModelType extends Model<SecurityDbType, {}, SecurityMethodsType> {
    createUser(login: string, email: string, passHash: string): HydratedSecurityType
}


const securitySchema = new mongoose.Schema<SecurityDbType, SecurityModelType, SecurityMethodsType>({
    userId: {type: Schema.Types.ObjectId, required: true},
    deviceId: {type: String, required: true},
    lastActiveDate: {type: Date, required: true},
    deviceName: {type: String, required: true},
    ip: {type: String, required: true},
    expireDate: {type: Date, required: true}
})
securitySchema.method('canBeConfirmed', function canBeConfirmed() {

})
securitySchema.static('createUser', function createUser(login: string, email: string, passHash: string) {
    return new SecurityModel({
        login,
        email,
        passHash,
        createdAt: new Date(),
        recoveryPassword: {
            expirationDate: new Date(),
            recoveryCode: '',
        },
        emailConfirmation: {
            expirationDate: add(new Date(), {
                minutes: 10,
            }),
            confirmationCode: uuidv7(),
            isConfirmed: false
        }
    })
})

export const SecurityModel = mongoose.model<SecurityDbType, SecurityModelType>(SETTINGS.DB.SESSION_COLLECTION_NAME, securitySchema)