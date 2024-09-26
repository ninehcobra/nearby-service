import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { PipelineStage } from 'mongoose';

export class QueryFilterBase {
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @ApiPropertyOptional({ required: false, example: 1 })
  @Min(1)
  offset?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional({ required: false, example: 20 })
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export const getBasePipeLine = (
  limit: number,
  offset: number,
): PipelineStage[] => {
  return [
    {
      $facet: {
        data: [{ $skip: (offset - 1) * limit }, { $limit: limit }],
        totalCount: [{ $count: 'total' }],
      },
    },
    {
      $project: {
        data: 1,
        count: { $size: '$data' },
        totalRecords: { $arrayElemAt: ['$totalCount.total', 0] },
        totalPages: {
          $ceil: {
            $divide: [{ $arrayElemAt: ['$totalCount.total', 0] }, limit],
          },
        },
      },
    },
  ];
};

export type PaginationLinks = {
  first: string;
  previous: string | null;
  next: string | null;
  last: string;
};

export class PaginationResult<T> {
  totalRecords: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  data: T[];
  links: PaginationLinks;
}
