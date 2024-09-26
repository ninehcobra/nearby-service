import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { Model } from 'mongoose';
import { FindNearbyServiceDto } from './dto/find-nearby-service.dto';
import { Business, BusinessDocument } from './entities/business.entity';
import { FindNearbyService } from './find-nearby.service';

@Controller('find-nearby')
@ApiTags('find-nearby')
export class FindNearbyController {
  constructor(
    private readonly findNearbyService: FindNearbyService,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
  ) {}

  @Get('')
  @HttpCode(200)
  async getNearByService(@Query() query: FindNearbyServiceDto) {
    console.log('co ke goi api');
    const data = plainToClass(FindNearbyServiceDto, query);
    return this.findNearbyService.findNearBy(data);
  }
}
