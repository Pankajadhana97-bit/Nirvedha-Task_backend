import { ExecutionContext, createParamDecorator } from "@nestjs/common";

type jwtPayloadRT = {
    sub: string;
    email: string;
    refreshToken: string;
}

export const getCurrentUser = createParamDecorator((data: keyof jwtPayloadRT | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as jwtPayloadRT;

    if (!data) {
        return user
    }
    return user[data]
})
