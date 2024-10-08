import bcrypt from 'bcrypt';

export const hashPassService = {
    async generateHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 12)
    },
    async checkPassword (password: string, hash: string) {
        return await bcrypt.compare(password, hash)
    }
}