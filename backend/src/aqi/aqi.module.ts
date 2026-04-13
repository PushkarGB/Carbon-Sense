import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AqiDataSchema } from '../schemas/aqi-data.schema';
import { AqiFetcherService } from './aqi-fetcher.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AqiData', schema: AqiDataSchema },
    ]),
  ],
  providers: [AqiFetcherService],
  exports: [AqiFetcherService],
})
export class AqiModule {}
