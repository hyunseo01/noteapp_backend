import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PinsModule } from './pins/pins.module';
import { UnitsModule } from './units/units.module';
import { PinDirectionsModule } from './pin-directions/pin-directions.module';
import { PinOptionsModule } from './pin-options/pin-options.module';
import { PinAreaGroupsModule } from './pin_area_groups/pin_area_groups.module';

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
    PinDirectionsModule,
    PinOptionsModule,
    PinAreaGroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
