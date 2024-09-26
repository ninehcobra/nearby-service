import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './entities/business.entity';
import { Category, CategorySchema } from './entities/category.entity';
import { Service, ServiceSchema } from './entities/service.entity';
import { FindNearbyController } from './find-nearby.controller';
import { FindNearbyService } from './find-nearby.service';

@Module({
  controllers: [FindNearbyController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Business.name,
        schema: BusinessSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Service.name,
        schema: ServiceSchema,
      },
    ]),
  ],
  providers: [FindNearbyService],
  exports: [FindNearbyService],
})
export class FindNearbyModule {}
