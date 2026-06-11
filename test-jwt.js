const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SUPABASE_JWT_SECRET;
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyaXd4aHRsdWhpdXV6Z3NmZXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjk5NjksImV4cCI6MjA5NDYwNTk2OX0.0O74YbWY6tLlYug8_LIyUtObxN-YPdEfyNDeglED7Es";

try {
  console.log("Verifying with secret as string...");
  jwt.verify(anonKey, secret);
  console.log("Success with string!");
} catch (e) {
  console.log("Failed with string:", e.message);
}

try {
  console.log("Verifying with secret as base64 buffer...");
  jwt.verify(anonKey, Buffer.from(secret, 'base64'));
  console.log("Success with base64 buffer!");
} catch (e) {
  console.log("Failed with base64 buffer:", e.message);
}

try {
  console.log("Verifying with secret as utf8 buffer...");
  jwt.verify(anonKey, Buffer.from(secret, 'utf8'));
  console.log("Success with utf8 buffer!");
} catch (e) {
  console.log("Failed with utf8 buffer:", e.message);
}

