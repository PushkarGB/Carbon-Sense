import { APP_FILTER } from '@nestjs/core';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorLogSchema } from '../schemas/error-log.schema';
import { ErrorLogService } from './error-log.service';
import { GlobalExceptionFilter } from './global-exception.filter';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ErrorLog', schema: ErrorLogSchema }]),
  ],
  providers: [
    ErrorLogService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [ErrorLogService],
})
export class ResilienceModule {}
