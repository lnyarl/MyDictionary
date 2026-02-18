import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import pg from "pg";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./common/access-logger";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { setApp } from "./globalApp";

// pg 설정: BigInt를 JavaScript의 number로 변환
// 일반으로는 안전하지 않지만, 이 프로젝트에서는 BigInt가 안전한 범위 내에 있다고 가정
pg.types.setTypeParser(20, (val) => {
  return parseInt(val, 10);
});

// stacktrace를 더 자세히 찍기 위한 라이브러리
if (process.env.NODE_ENV !== "production") {
  require("longjohn");
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setApp(app);

  // CORS 설정 - 개발 환경에서는 모든 오리진 허용
  const isDevelopment = process.env.NODE_ENV !== "production";
  app.enableCors({
    origin: isDevelopment
      ? true
      : [
          process.env.FRONTEND_URL || "http://localhost:5173",
          process.env.ADMIN_FRONTEND_URL || "http://localhost:5174",
        ],
    credentials: true,
  });

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

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

  const logger = new Logger("Bootstrap");
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment (NODE_ENV): ${process.env.NODE_ENV || "development"}`);
  logger.log(`Environment (ENV): ${process.env.ENV || "not set"}`);
}
bootstrap();
