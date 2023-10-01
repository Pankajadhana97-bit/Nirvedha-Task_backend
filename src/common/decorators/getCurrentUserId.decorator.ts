import { createParamDecorator, ExecutionContext } from "@nestjs/common";


type jwtPayload = {
    sub: string;
    email: string;
}

export const getCurrentUserId = createParamDecorator((_: undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as jwtPayload;
    return user.sub;
})
