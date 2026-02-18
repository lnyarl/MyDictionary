import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser
  app.use(cookieParser());

  // CORS configuration
  const isDevelopment = process.env.NODE_ENV !== "production";
  app.enableCors({
    origin: isDevelopment
      ? true
      : process.env.ADMIN_FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  const logger = new Logger("AdminBootstrap");
  logger.log(`Admin backend running on: http://localhost:${port}`);
  logger.log(
    `Environment (NODE_ENV): ${process.env.NODE_ENV || "development"}`,
  );
  logger.log(`Environment (ENV): ${process.env.ENV || "not set"}`);
}

bootstrap();
