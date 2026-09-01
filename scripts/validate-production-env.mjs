const requiredEnvironmentVariables = [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "AUTH_SECRET",
  "AUTH_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_ADMIN_CHAT_ID",
];

const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
  (name) => !process.env[name]?.trim(),
);

if (missingEnvironmentVariables.length > 0) {
  console.error(
    `Production environment validation failed. Missing required variables: ${missingEnvironmentVariables.join(", ")}`,
  );
  process.exit(1);
}

console.log("Production environment validation passed.");
