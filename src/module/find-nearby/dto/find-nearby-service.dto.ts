import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { BusinessConstant } from 'src/common/constant';
import { DayEnum } from 'src/common/enum';
import { QueryFilterBase } from 'src/core/pagination';

export enum TimeOpenTypeEnum {
  EVERY_TIME = 'every_time',
  IS_OPENING = 'is_opening',
  ALL_DAY = 'all_day',
  SPECIFIC_TIME = 'specific_time',
}

export class CertainTime {
  @ApiPropertyOptional({ enum: DayEnum })
  @IsEnum(DayEnum)
  day: DayEnum;

  @Matches(BusinessConstant.regexOpenCloseTime, {
    message:
      'open time format is invalid. Open time must be in format HH:MM or HH must be 00 to 23 or MM must be one of 00, 05, 10, 15,..., 50, 55',
  })
  @ApiPropertyOptional({ example: '08:00' })
  openTime?: string;
}

export class TimeOpen {
  @ApiProperty({ enum: TimeOpenTypeEnum })
  @IsEnum(TimeOpenTypeEnum)
  type: TimeOpenTypeEnum;

  @ApiProperty({ type: CertainTime, required: false })
  @ValidateNested({ each: true })
  @Type(() => CertainTime)
  @IsOptional()
  certainTime?: CertainTime;
}

const AvailableStar = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export class FindNearbyServiceDto extends QueryFilterBase {
  @ApiPropertyOptional({ example: 'Nhà hàng gần đây' })
  q: string;

  @IsNotEmpty()
  @ApiProperty({ example: '10.78' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @ApiProperty({ example: '106.78' })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @Min(0.5)
  @Max(20)
  @ApiProperty({ example: '10', description: 'Radius in kilometer' })
  radius: number;

  @ApiPropertyOptional({ default: false })
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  isHighRating?: boolean = true;

  @ApiPropertyOptional({ enum: TimeOpenTypeEnum })
  @IsEnum(TimeOpenTypeEnum)
  @IsOptional()
  timeOpenType: TimeOpenTypeEnum = TimeOpenTypeEnum.EVERY_TIME;

  @ApiPropertyOptional({ enum: DayEnum })
  @ValidateIf((o) => o.timeOpenType === TimeOpenTypeEnum.SPECIFIC_TIME)
  @IsNotEmpty({
    message: 'day is required when timeOpenType is SPECIFIC_TIME, ',
  })
  @IsEnum(DayEnum)
  day?: DayEnum;

  @ApiPropertyOptional({ example: '08:00' })
  @ValidateIf((o) => o.timeOpenType === TimeOpenTypeEnum.SPECIFIC_TIME)
  @IsNotEmpty({
    message: 'openTime is required when timeOpenType is SPECIFIC_TIME',
  })
  @Matches(BusinessConstant.regexOpenCloseTime, {
    message:
      'openTime format is invalid. Open time must be in format HH:MM or HH must be 00 to 23 or MM must be one of 00, 05, 10, 15,..., 50, 55',
  })
  openTime?: string;

  @IsIn(AvailableStar, {
    message: 'star gotta be in [0.5,1,1.5,2,2.5,3,3.5,4,4.5,5]',
  })
  @Transform(({ value }) => parseFloat(value))
  @ApiPropertyOptional()
  @IsOptional()
  star: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: 'categoryId is invalid objectId' })
  categoryId: string;

  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  isNearest: boolean;
}
