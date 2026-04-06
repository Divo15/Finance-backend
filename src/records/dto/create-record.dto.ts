import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export enum RecordType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class CreateRecordDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(RecordType)
  type: RecordType;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}