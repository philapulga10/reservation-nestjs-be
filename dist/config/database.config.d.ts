import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
export declare class DatabaseConfig implements MongooseOptionsFactory {
    private configService;
    constructor(configService: ConfigService);
    createMongooseOptions(): MongooseModuleOptions;
}
