import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class refreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.REFRESH_SECRET,
            passReqToCallback: true,
        })
    }

    async validate(req: Request, payload: any) {
        const refreshToken = await req.get('Authorization')?.replace('Bearer', '')?.trim();
        return {
            ...payload,
            refreshToken
        }
    }
} 