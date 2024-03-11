import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function main() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();
  app.setGlobalPrefix('/api')
  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    }
  ))
  await app.listen(process.env.PORT);
  logger.log(`App listening on port ${process.env.PORT}`);
}
main();
