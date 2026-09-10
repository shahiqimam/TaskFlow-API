import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ProjectMemberRole } from '../../common/enums/project-member-role.enum';

export class AddMemberDto {
  @ApiProperty({ example: '4c7536e3-d765-43c1-a46d-4ff426c80030' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ enum: ProjectMemberRole, default: ProjectMemberRole.MEMBER })
  @IsOptional()
  @IsEnum(ProjectMemberRole)
  memberRole?: ProjectMemberRole;
}
