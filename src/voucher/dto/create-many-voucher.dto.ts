import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateManyVoucherDto {
  @ApiProperty()
  @IsNumber()
  codeLength: 8;

  @ApiProperty()
  @IsNumber()
  count = 1;

  @ApiProperty()
  @IsNumber()
  discountPercentage: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsDateString()
  expiresAt: string;
}
