import { ValidationPipe } from "@nestjs/common";
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
    origin: isDevelopment ? true : process.env.ADMIN_FRONTEND_URL || "http://localhost:81",
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
  console.log(`Admin backend running on: http://localhost:${port}`);
  console.log(`Environment (NODE_ENV): ${process.env.NODE_ENV || "development"}`);
  console.log(`Environment (ENV): ${process.env.ENV || "not set"}`);
}

bootstrap();
