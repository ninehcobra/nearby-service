import { number } from '@hapi/joi';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { BusinessStatusEnum, StarEnum } from 'src/common/enum';
import { BaseEntity } from 'src/core/entity/base/entity.base';
import { DayOpenCloseTimeSchema } from './dayOpenCloseTime.entity';
import { Image } from './image.entity';
import { StarSchema } from './star.entity';

const defaultStars: StarSchema[] = [
  {
    star: StarEnum.ONE,
    count: 0,
  },
  {
    star: StarEnum.TWO,
    count: 0,
  },
  {
    star: StarEnum.THREE,
    count: 0,
  },
  {
    star: StarEnum.FOUR,
    count: 0,
  },
  {
    star: StarEnum.FIVE,
    count: 0,
  },
];

@Schema({})
export class SimpleServiceSchema {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  @Exclude()
  _id: ObjectId;

  @Transform((value) => value.obj?._id?.toString(), { toClassOnly: true })
  @Expose()
  id?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: number })
  order: number;
}

@Schema({})
export class SimpleCategorySchema {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Category' })
  @Exclude()
  _id: ObjectId;

  @Expose()
  @Transform((value) => value.obj?._id?.toString(), { toClassOnly: true })
  id?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  linkURL: string;
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Business extends BaseEntity {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ default: '', trim: true, maxlength: 500 })
  description: string;

  @Prop({ default: '', trim: true })
  phoneNumber: string;

  @Prop({ default: '', trim: true })
  website: string;

  @Prop({ type: [Image], default: [] })
  images: Image[];

  @Prop({ required: true })
  @Type(() => SimpleCategorySchema)
  category: SimpleCategorySchema;

  @Prop({ type: [SimpleServiceSchema] })
  @Type(() => SimpleServiceSchema)
  services: SimpleServiceSchema[];

  @Prop({ default: 0 })
  overallRating: number;

  @Prop({ default: 0 })
  totalReview: number;

  @Prop({ type: [StarSchema], default: defaultStars })
  stars: StarSchema[];

  @Prop({ trim: true })
  addressLine: string;

  @Prop({ trim: true })
  fullAddress: string;

  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  country: string;

  @Prop([DayOpenCloseTimeSchema])
  dayOfWeek: DayOpenCloseTimeSchema[];

  @Prop({
    type: {
      type: String,
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    coordinates: number[];
  };

  @Prop({
    enum: BusinessStatusEnum,
    default: BusinessStatusEnum.PENDING,
  })
  @Exclude()
  status: BusinessStatusEnum;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Exclude()
  userId: Types.ObjectId;

  // Declare the virtual property
  _distance?: number;

  @Transform((value) => value.obj?.userId?.toString(), { toClassOnly: true })
  @Expose()
  user_id?: string;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.virtual('distance')
  .get(function () {
    return this._distance;
  })
  .set(function (value) {
    this._distance = value;
  });
BusinessSchema.index({ location: '2dsphere' });
BusinessSchema.index({ name: 'text', description: 'text' });

export type BusinessDocument = HydratedDocument<Business>;
