import bcrypt from 'bcrypt';

export const hashPassService = {
    async generateHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 12)
    },
    async validatePassword(password: string, hash: string) {
        return await bcrypt.compare(password, hash)
    }
}