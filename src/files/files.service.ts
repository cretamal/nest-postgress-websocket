import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
 
    getstaticProductImages ( imageName: string ) {

        const path = join(__dirname, '../../static/products', imageName);

        if( !existsSync(path) ) throw new BadRequestException(`Not product foud with image ${ imageName }  `)
        
        return path;       

    }
  

}
