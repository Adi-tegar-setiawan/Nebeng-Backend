import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class UpdateLocationDto {
  @IsNotEmpty()
  @IsString()
  tripId!: string;

  @IsNotEmpty()
  @IsNumber()
  @IsLatitude()
  latitude!: number;

  @IsNotEmpty()
  @IsNumber()
  @IsLongitude()
  longtitude!: number;
}
