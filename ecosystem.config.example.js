/**
 * PM2 Ecosystem Configuration - EXAMPLE
 * 
 * IMPORTANTE: Este es un archivo de ejemplo. Para usar en producción:
 * 
 * 1. Copiar este archivo a ecosystem.config.js
 * 2. Configurar las variables de entorno en el servidor:
 *    export DB_PASSWORD="tu-password-seguro"
 *    export JWT_SECRET="tu-jwt-secret-seguro"
 *    export AWS_ACCESS_KEY_ID="tu-aws-access-key"
 *    export AWS_SECRET_ACCESS_KEY="tu-aws-secret-key"
 *    export SMTP_PASSWORD="tu-smtp-password"
 *    export BOLD_API_KEY="tu-bold-api-key"
 *    export BOLD_SECRET_KEY="tu-bold-secret-key"
 *    export BOLD_WEBHOOK_SECRET="tu-bold-webhook-secret"
 * 
 * 3. O crear un archivo .env en el servidor con estas variables
 * 4. Reiniciar PM2: pm2 restart datagree
 */

module.exports = {
  apps: [
    {
      name: 'datagree',
      script: './backend/dist/main.js',
      cwd: '/home/ubuntu/consentimientos_aws',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_PREFIX: 'api',
        BASE_DOMAIN: 'archivoenlinea.com',
        
        // Database
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'datagree_admin',
        DB_PASSWORD: process.env.DB_PASSWORD || 'change-this-password',
        DB_DATABASE: 'consentimientos',
        
        // JWT
        JWT_SECRET: process.env.JWT_SECRET || 'change-this-jwt-secret',
        JWT_EXPIRATION: '7d',
        
        // AWS S3
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: 'us-east-1',
        AWS_S3_BUCKET: 'datagree-uploads',
        USE_S3: 'true',
        
        // SMTP
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: 587,
        SMTP_SECURE: 'false',
        SMTP_USER: process.env.SMTP_USER || 'info@innovasystems.com.co',
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
        SMTP_FROM: process.env.SMTP_FROM || 'info@innovasystems.com.co',
        SMTP_FROM_NAME: 'Archivo en Línea',
        
        // Security
        BCRYPT_ROUNDS: 10,
        RATE_LIMIT_TTL: 60,
        RATE_LIMIT_MAX: 100,
        CORS_ORIGIN: 'https://archivoenlinea.com,https://admin.archivoenlinea.com,https://*.archivoenlinea.com',
        
        // Bold Payment Gateway
        BOLD_API_KEY: process.env.BOLD_API_KEY,
        BOLD_SECRET_KEY: process.env.BOLD_SECRET_KEY,
        BOLD_MERCHANT_ID: process.env.BOLD_MERCHANT_ID || '2M0MTRAD37',
        BOLD_API_URL: 'https://api.online.payments.bold.co',
        BOLD_WEBHOOK_SECRET: process.env.BOLD_WEBHOOK_SECRET,
        BOLD_SUCCESS_URL: 'https://datagree.net/payment/success',
        BOLD_FAILURE_URL: 'https://datagree.net/payment/failure',
        BOLD_WEBHOOK_URL: 'https://datagree.net/api/webhooks/bold',
        
        // Super Admin
        SUPER_ADMIN_EMAIL: 'rcaraballo@innovasystems.com.co',
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
