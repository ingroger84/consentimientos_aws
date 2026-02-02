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
        BASE_DOMAIN: 'your-domain.com',
        
        // Database Configuration
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'your_db_user',
        DB_PASSWORD: 'your_secure_db_password',
        DB_DATABASE: 'your_database_name',
        
        // JWT Configuration
        JWT_SECRET: 'your-jwt-secret-key-change-this-to-random-string',
        JWT_EXPIRATION: '7d',
        
        // AWS S3 Configuration
        AWS_ACCESS_KEY_ID: 'your_aws_access_key',
        AWS_SECRET_ACCESS_KEY: 'your_aws_secret_key',
        AWS_REGION: 'us-east-1',
        AWS_S3_BUCKET: 'your-s3-bucket-name',
        USE_S3: 'true',
        
        // SMTP Configuration
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: 587,
        SMTP_SECURE: 'false',
        SMTP_USER: 'your-email@domain.com',
        SMTP_PASSWORD: 'your-smtp-app-password',
        SMTP_FROM: 'your-email@domain.com',
        SMTP_FROM_NAME: 'Your Company Name',
        
        // Security Configuration
        BCRYPT_ROUNDS: 10,
        RATE_LIMIT_TTL: 60,
        RATE_LIMIT_MAX: 100,
        CORS_ORIGIN: 'https://your-domain.com,https://admin.your-domain.com,https://*.your-domain.com',
        
        // Bold Payment Gateway Configuration
        BOLD_API_KEY: 'your_bold_api_key',
        BOLD_SECRET_KEY: 'your_bold_secret_key',
        BOLD_MERCHANT_ID: 'your_merchant_id',
        BOLD_API_URL: 'https://api.online.payments.bold.co',
        BOLD_SUCCESS_URL: 'https://your-domain.com/payment/success',
        BOLD_FAILURE_URL: 'https://your-domain.com/payment/failure',
        BOLD_WEBHOOK_URL: 'https://your-domain.com/api/webhooks/bold',
        
        // Frontend URL
        FRONTEND_URL: 'https://your-domain.com',
        
        // Super Admin Email
        SUPER_ADMIN_EMAIL: 'admin@your-domain.com',
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
