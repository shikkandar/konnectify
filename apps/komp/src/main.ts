import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { KompModule } from './komp.module';

async function bootstrap() {
  const app = await NestFactory.create(KompModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('Your API description')
    .setVersion('1.0')
    .addTag('your-tag') // Optional: add tags for grouping
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // This will make Swagger UI available at /api

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Application is running on: ${port}`);
  console.log(`Swagger documentation available at: ${port}/api`);
}
bootstrap().catch((err) => {
  console.error('Error starting application', err);
});
