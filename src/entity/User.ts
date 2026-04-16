import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    firstName!: string

    @Column()
    lastName!: string

    @Column({ unique: true })
    username!: string

    @Column()
    age!: number
    
    @Column()
    password!: string
    
    @Column({default:"user"})
    role!: string
}
