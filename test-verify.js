const { ExtractJwt, Strategy } from 'passport-jwt';
require('dotenv').config();

const secret = process.env.SUPABASE_JWT_SECRET;
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyaXd4aHRsdWhpdXV6Z3NmZXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjk5NjksImV4cCI6MjA5NDYwNTk2OX0.0O74YbWY6tLlYug8_LIyUtObxN-YPdEfyNDeglED7Es";

const strat = new Strategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret
}, (payload, done) => done(null, payload));

strat.fail = (info) => console.log("Fail:", info);
strat.success = (user) => console.log("Success:", user);
strat.error = (err) => console.log("Error:", err);

strat.authenticate({
  headers: { authorization: `Bearer ${anonKey}` }
});
