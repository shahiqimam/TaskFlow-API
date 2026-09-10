import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'I updated the task description with the latest requirements.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
