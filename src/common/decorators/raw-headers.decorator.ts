import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const RawHeaders = createParamDecorator (
 
    (data: string[], ctx: ExecutionContext) => {
        const req           = ctx.switchToHttp().getRequest();        
        const rawHeaders    = req.rawHeaders;

        if( !rawHeaders ) throw new InternalServerErrorException('Not header raw found');


        return rawHeaders;
    }

)