import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { BranchesModule } from './branches/branches.module';
import { ServicesModule } from './services/services.module';
import { ConsentsModule } from './consents/consents.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { SettingsModule } from './settings/settings.module';
import { TenantsModule } from './tenants/tenants.module';
import { PlansModule } from './plans/plans.module';
import { PaymentsModule } from './payments/payments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { BillingModule } from './billing/billing.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { CommonModule } from './common/common.module';
import { Role } from './roles/entities/role.entity';
import { User } from './users/entities/user.entity';
import { Branch } from './branches/entities/branch.entity';
import { Service } from './services/entities/service.entity';
import { Question } from './questions/entities/question.entity';
import { Consent } from './consents/entities/consent.entity';
import { Answer } from './answers/entities/answer.entity';
import { AppSettings } from './settings/entities/app-settings.entity';
import { Tenant } from './tenants/entities/tenant.entity';
import { Payment } from './payments/entities/payment.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { TaxConfig } from './invoices/entities/tax-config.entity';
import { PaymentReminder } from './billing/entities/payment-reminder.entity';
import { BillingHistory } from './billing/entities/billing-history.entity';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { TenantGuard } from './common/guards/tenant.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          Role,
          User,
          Branch,
          Service,
          Question,
          Consent,
          Answer,
          AppSettings,
          Tenant,
          Payment,
          Invoice,
          TaxConfig,
          PaymentReminder,
          BillingHistory,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('RATE_LIMIT_TTL', 60) * 1000,
          limit: configService.get('RATE_LIMIT_MAX', 100),
        },
      ],
      inject: [ConfigService],
    }),

    // Common module (guards, decorators, etc.)
    CommonModule,

    // Feature modules
    AuthModule,
    UsersModule,
    RolesModule,
    BranchesModule,
    ServicesModule,
    ConsentsModule,
    QuestionsModule,
    AnswersModule,
    SettingsModule,
    TenantsModule,
    PlansModule,
    PaymentsModule,
    InvoicesModule,
    BillingModule,
    WebhooksModule,

    // Serve static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [
    // Registrar TenantGuard globalmente
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar TenantMiddleware a todas las rutas
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
