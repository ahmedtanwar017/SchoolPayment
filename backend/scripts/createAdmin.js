const mongoose = require("mongoose");
const config = require("config");
const readline = require("readline");
const bcrypt = require("bcrypt");
const colors = require("colors/safe");

// Import User model
const User = require("../models/user-model");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utility: Ask question
const askQuestion = (query, hidden = false) => {
  return new Promise((resolve) => {
    if (!hidden) return rl.question(query, resolve);

    // For hidden input (like password masking)
    const stdin = process.openStdin();
    process.stdin.on("data", (char) => {
      char = char + "";
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.pause();
          break;
        default:
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(query + Array(rl.line.length + 1).join("*"));
          break;
      }
    });
    rl.question(query, resolve);
  });
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = config.get("MONGODB_URI");
    if (!mongoURI) throw new Error("Mongo URI not defined in config/environment");

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(colors.green("MongoDB connected successfully.\n"));
  } catch (err) {
    console.error(colors.red("MongoDB connection error:"), err.message);
    process.exit(1);
  }
};

(async () => {
  try {
    console.log(colors.cyan("\n--- Admin Creation Script ---\n"));

    // Step 1: Connect to DB
    await connectDB();

    // Step 2: Collect inputs with validation
    let email, fullname, password;

    while (!email) {
      const input = await askQuestion("Enter admin email: ");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        console.log(colors.red("Invalid email format. Please try again."));
      } else {
        email = input.trim().toLowerCase();
      }
    }

    while (!fullname) {
      const input = await askQuestion("Enter admin full name: ");
      if (input.length < 2) {
        console.log(colors.red("Full name must be at least 2 characters."));
      } else {
        fullname = input.trim();
      }
    }

    while (!password) {
      const input = await askQuestion("Enter admin password: ", true);
      if (input.length < 6) {
        console.log(colors.red("Password must be at least 6 characters."));
      } else {
        password = input;
      }
    }

    // Step 3: Check if admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(colors.red("An admin with this email already exists."));
      process.exit(1);
    }

    // Step 4: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 5: Create admin user
    const admin = new User({
      fullname,
      email,
      password: hashedPassword,
      isAdmin: true, // Ensure schema supports this field
    });

    await admin.save();

    console.log(colors.green("\nAdmin created successfully."));
    console.log(colors.yellow(`Email: ${email}`));
    console.log(colors.yellow(`Full Name: ${fullname}`));
  } catch (err) {
    console.error(colors.red("Error creating admin:"), err.message);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
})();
