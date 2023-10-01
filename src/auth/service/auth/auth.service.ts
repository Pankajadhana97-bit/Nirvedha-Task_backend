import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import { AuthDto } from 'src/auth/dto';
import { Tokens } from 'src/auth/types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    // signIn to the application/database
    async signupLocal(dto: AuthDto): Promise<Tokens> {
        try {
            const { email, password } = dto;
            const hash = await this.hashPassword(password);
            const newUser = await this.prisma.user.create({
                data: {
                    email, hash,
                }
            })
            const tokens = await this.getTokens(newUser.id, newUser.email)
            console.log(`current hashRT`, newUser.hashedRT)
            await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);
            return tokens;

        } catch (error) {
            console.log("Error in the signup", error)
        }
    }

    // signIn local service
    async signinLocal(dto: AuthDto): Promise<Tokens> {
        try {
            const { email, password }: any = dto
            const user = await this.prisma.user.findUnique({
                where: { email }
            })

            if (!user) {
                throw new ForbiddenException('Access Denied')
            }
            //console.log(password, user.hash)
            const matchPassword = await bcrypt.compare(password, user.hash);
            if (!matchPassword) {
                throw new ForbiddenException("Acess Denied")
            }

            const tokens = await this.getTokens(user.id, user.email);
            await this.updateRefreshTokenHash(user.id, tokens.refresh_token)
            return tokens;
        }
        catch (error) {
            console.log('Error in the signIn :', error)
        }
    }


    // signout local service
    async logout(userId: number): Promise<boolean> {
        const response = await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRT: {
                    not: null,
                },
            },
            data: {
                hashedRT: null,
            },
        }).catch(error => {
            console.log(error)
        })
        return true;
    }

    async refreshToken(userId: number, refreshToken: string): Promise<any> {
        const User = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
            .catch(error => console.log(error))

        if (!User) {
            throw new ForbiddenException("Access Denied");
        }

        const refreshTokenMatch = await bcrypt.compare(refreshToken, User.hashedRT).catch(
            error => console.log(`something went wrong` + error)
        );

        if (!refreshTokenMatch) {
            throw new ForbiddenException('Access Denied')
        }
        const tokens = await this.getTokens(User.id, User.email);
        await this.updateRefreshTokenHash(User.id, tokens.refresh_token);
        //console.log(tokens)
        return tokens;
    }




    // utility functions for services
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async getTokens(userId: number, email: string): Promise<Tokens> {
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email: email,
            }, {
                secret: process.env.ACCESS_SECRET,
                expiresIn: '15m',
            }),

            this.jwtService.signAsync({
                sub: userId,
                email: email,
            }, {
                secret: process.env.REFRESH_SECRET,
                expiresIn: '1d',
            })
        ])

        return {
            access_token, refresh_token,
        }
    }

    async updateRefreshTokenHash(userId: number, refreshToken: string) {
        const hashedRT = await this.hashPassword(refreshToken);
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hashedRT,
            }
        })
        return true
    }
}
