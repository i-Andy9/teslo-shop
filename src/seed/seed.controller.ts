import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service'; 
import { AuthDecorator } from 'src/auth/decorator';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @AuthDecorator(ValidRoles.superUser)
  executedSeed() {

    return this.seedService.runSeed();
  }

}
