const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

const registerUser = async (data) => {
  const { name, email, password, role, phone } = data;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required.', 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { Email: email }
  });

  if (existingUser) {
    throw new AppError('A user with this email already exists.', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      Name: name,
      Email: email,
      Password: hashedPassword,
      Role: role ? role.toUpperCase() : 'STUDENT',
      Phone: phone || null
    },
    select: {
      UserID: true,
      Name: true,
      Email: true,
      Role: true,
      Phone: true,
      createdAt: true
    }
  });

  return newUser;
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide both email and password.', 400);
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { Email: email }
  });

  if (!user) {
    throw new AppError('Incorrect email or password.', 401);
  }

  // Check password
  const isPasswordCorrect = await bcrypt.compare(password, user.Password);
  if (!isPasswordCorrect) {
    throw new AppError('Incorrect email or password.', 401);
  }

  // Sign JWT
  const token = jwt.sign(
    { userId: user.UserID, role: user.Role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      userId: user.UserID,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      phone: user.Phone
    }
  };
};

module.exports = {
  registerUser,
  loginUser
};
