import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PinsModule } from './pins/pins.module';
import { UnitsModule } from './units/units.module';
import { PinAreaTypesModule } from './pin-area-types/pin-area-types.module';
import { PinDirectionsModule } from './pin-directions/pin-directions.module';
import { UnitOptionModule } from './unit-option/unit-option.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 3306),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        autoLoadEntities: true,
        synchronize: true, // 개발용
        logging: ['error', 'schema', 'warn', 'query'],
      }),
    }),
    PinsModule,
    UnitsModule,
    PinAreaTypesModule,
    PinDirectionsModule,
    UnitOptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
