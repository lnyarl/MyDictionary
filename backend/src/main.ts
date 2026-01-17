import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie Parser
  app.use(cookieParser());

  // CORS 설정 - 개발 환경에서는 모든 오리진 허용
  const isDevelopment = process.env.NODE_ENV !== "production";
  app.enableCors({
    origin: isDevelopment ? true : process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment (NODE_ENV): ${process.env.NODE_ENV || "development"}`);
  console.log(`Environment (ENV): ${process.env.ENV || "not set"}`);
}
bootstrap();
