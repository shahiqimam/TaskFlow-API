import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { healthExample } from './common/swagger/api-examples';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ description: 'API health status.', example: healthExample })
  getHealth() {
    return { status: 'ok' };
  }
}
