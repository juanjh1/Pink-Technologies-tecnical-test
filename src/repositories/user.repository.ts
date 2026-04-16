import { User } from '../entity/User.js'
import { AppDataSource } from '../data-source.js'

export const UserRepository = AppDataSource.getRepository(User).extend({
    findByName(firstName: string, lastName: string) {
        return this.createQueryBuilder("user")
            .where("user.firstName = :firstName", { firstName })
            .andWhere("user.lastName = :lastName", { lastName })
            .getMany()
    },
})
