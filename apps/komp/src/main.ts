import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { KompModule } from './komp.module';

async function bootstrap() {
  const app = await NestFactory.create(KompModule);

  const config = new DocumentBuilder().setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Application is running on: ${port}`);
  console.log(`Swagger documentation available at: ${port}/api`);
}
bootstrap().catch((err) => {
  console.error('Error starting application', err);
});
