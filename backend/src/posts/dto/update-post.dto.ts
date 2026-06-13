import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;

  @IsOptional()
  @IsArray()
  imageIds?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];
}
