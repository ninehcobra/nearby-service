import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import * as Dayjs from 'dayjs';
import * as geolib from 'geolib';
import { Model, PipelineStage } from 'mongoose';
import { BusinessConstant, FindNearByConstant } from 'src/common/constant';
import { BusinessStatusEnum, DayEnum } from 'src/common/enum';
import { createQueryParams, transStringToObjectId } from 'src/common/utils';
import { PaginationResult, getBasePipeLine } from 'src/core/pagination';
import {
  FindNearbyServiceDto,
  TimeOpenTypeEnum,
} from './dto/find-nearby-service.dto';
import { Business, BusinessDocument, BusinessSchema } from './entities/business.entity';
@Injectable()
export class FindNearbyService {
  constructor(
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
  ) {}

  async findNearBy(
    data: FindNearbyServiceDto,
  ): Promise<PaginationResult<Business>> {
    const pipeLine = await this.getPipeLineQueryNearByService(data);
    const aggregateResult = await this.businessModel.aggregate(pipeLine).exec();
    const businesses = aggregateResult[0]['data'].map((business: Business) => {
      const businessObj = plainToClass(Business, business, {
        // enableImplicitConversion: true,
      });

      const distance = geolib.getDistance(
        { latitude: data.latitude, longitude: data.longitude },
        {
          latitude: businessObj.location.coordinates[1],
          longitude: businessObj.location.coordinates[0],
        },
      );
      businessObj._distance = distance;
      return businessObj;
    });
    if (data.isNearest === true) {
      businesses.sort((a, b) => a._distance - b._distance);
    }
    return {
      totalRecords: aggregateResult[0]['totalRecords'],
      pageSize: aggregateResult[0]['count'],
      currentPage: data.offset,
      totalPages: aggregateResult[0]['totalPages'],
      data: businesses,
      links: this.createLink(
        data,
        'http://localhost:3000/find-nearby',
        aggregateResult[0]['totalPages'],
      ),
    };
  }

  private async getPipeLineQueryNearByService(data: FindNearbyServiceDto) {
    let basePipeLineOfPagination = getBasePipeLine(data.limit, data.offset);
    const optionalPipeLine = await this.configPipeLineQueryForFindNearBy(data);

    if (optionalPipeLine) {
      basePipeLineOfPagination = [
        ...optionalPipeLine,
        ...basePipeLineOfPagination,
      ];
    }
    return basePipeLineOfPagination;
  }

  createLink(queryData: any, URL: string, totalPage: number) {
    const offset = queryData.offset;
    const limit = queryData.limit;
    const firstLink = createQueryParams({ ...queryData, offset: 1 });
    const lastLink = createQueryParams({
      ...queryData,
      offset: totalPage,
    });
    const previousLink = createQueryParams({
      ...queryData,
      offset: offset - 1,
    });
    const nextLink = createQueryParams({
      ...queryData,
      offset: offset + 1,
    });

    let links = {
      first: `${URL}?${firstLink}`,
      previous: offset - 1 > 0 ? `${URL}?${previousLink}` : null,
      next: offset + 1 <= totalPage ? `${URL}?${nextLink}` : null,
      last: `${URL}?${lastLink}`,
    };

    return links;
  }

  mappingDayJsToDay(currentDay: number): DayEnum {
    let day: DayEnum;
    switch (currentDay) {
      case 0:
        day = DayEnum.SUNDAY;
        break;
      case 1:
        day = DayEnum.MONDAY;
        break;
      case 2:
        day = DayEnum.TUESDAY;
        break;
      case 3:
        day = DayEnum.WEDNESDAY;
        break;
      case 4:
        day = DayEnum.THURSDAY;
        break;
      case 5:
        day = DayEnum.FRIDAY;
        break;
      case 6:
        day = DayEnum.SATURDAY;
        break;
    }
    return day;
  }

  async configPipeLineQueryForFindNearBy(
    data: FindNearbyServiceDto,
  ): Promise<PipelineStage[] | null> {
    let matchStage: Record<string, any> = {
      status: { $eq: BusinessStatusEnum.APPROVED },
      location: {
        $geoWithin: {
          $centerSphere: [
            [data.longitude, data.latitude],
            data.radius / FindNearByConstant.EARTH_RADIUS, // Chuyển đổi radius sang radian
          ],
        },
      },
    };
    let sortStage: Record<string, any> = {};
    let finalPipeline: PipelineStage[] = [];

    if (data.q) {
      matchStage['$text'] = { $search: data.q };
      sortStage['score'] = { $meta: 'textScore' };
    }

    if (data.star) {
      matchStage['overallRating'] = { $gte: data.star };
    }
    if (data.categoryId) {
      matchStage['category._id'] = transStringToObjectId(data.categoryId);
    }

    sortStage['overallRating'] = data.isHighRating === true ? -1 : 1;

    if (data.timeOpenType != TimeOpenTypeEnum.EVERY_TIME) {
      const currentDay: DayEnum = this.mappingDayJsToDay(Dayjs().day());
      const currentTime = new Date().toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      switch (data.timeOpenType) {
        case TimeOpenTypeEnum.IS_OPENING:
          matchStage['dayOfWeek'] = {
            $elemMatch: {
              day: currentDay,
              openTime: { $lte: currentTime },
              closeTime: { $gt: currentTime },
            },
          };
          break;
        case TimeOpenTypeEnum.ALL_DAY:
          matchStage['dayOfWeek'] = {
            $elemMatch: {
              day: currentDay,
              openTime: { $eq: BusinessConstant.OPEN_TIME_ALL_DAY },
              closeTime: { $eq: BusinessConstant.CLOSE_TIME_ALL_DAY },
            },
          };
          break;
        case TimeOpenTypeEnum.SPECIFIC_TIME:
          matchStage['dayOfWeek'] = {
            $elemMatch: {
              day: data.day,
              openTime: { $lte: data.openTime },
              closeTime: { $gt: data.openTime },
            },
          };
          break;
      }
    }

    if (Object.keys(matchStage).length > 0) {
      finalPipeline.push({ $match: matchStage });
    }

    if (data.q) {
      finalPipeline.push({
        $addFields: {
          score: { $meta: 'textScore' },
        },
      });
    }

    if (Object.keys(sortStage).length > 0) {
      finalPipeline.push({ $sort: sortStage });
    }

    return finalPipeline.length > 0 ? finalPipeline : null;
  }
}
