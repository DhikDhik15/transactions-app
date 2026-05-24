const { createApp } = require('./src/app');
const { connectDatabase, seedServices } = require('./src/models');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = createApp();

  try {
    await connectDatabase();
    await seedServices();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();
