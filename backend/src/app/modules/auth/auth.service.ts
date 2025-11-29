import jwt from 'jsonwebtoken';
import ApiError from '../../../utils/ApiError';
import User from './auth.model';
import {
  IAuthResponse,
  ILoginRequest,
  IRegisterRequest,
  IJwtPayload,
} from './auth.types';

class AuthService {
  // Generate access token
  private generateAccessToken(payload: IJwtPayload): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '7d';

    if (!secret) {
      throw new ApiError(500, 'JWT access secret is not configured');
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  // Generate refresh token
  private generateRefreshToken(payload: IJwtPayload): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    if (!secret) {
      throw new ApiError(500, 'JWT refresh secret is not configured');
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  // Register new user
  async register(userData: IRegisterRequest): Promise<IAuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // Create new user
    const user = await User.create(userData);

    // Generate tokens
    const jwtPayload: IJwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(jwtPayload);
    const refreshToken = this.generateRefreshToken(jwtPayload);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  // Login user
  async login(loginData: ILoginRequest): Promise<IAuthResponse> {
    // Find user with password field
    const user = await User.findOne({ email: loginData.email }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate tokens
    const jwtPayload: IJwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(jwtPayload);
    const refreshToken = this.generateRefreshToken(jwtPayload);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh access token
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const secret = process.env.JWT_REFRESH_SECRET;

    if (!secret) {
      throw new ApiError(500, 'JWT refresh secret is not configured');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(token, secret) as IJwtPayload;

      // Find user and check if refresh token matches
      const user = await User.findById(decoded.userId).select('+refreshToken');

      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      if (user.refreshToken !== token) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Your account has been deactivated');
      }

      // Generate new access token
      const jwtPayload: IJwtPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = this.generateAccessToken(jwtPayload);

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'Refresh token expired');
      }
      throw error;
    }
  }

  // Logout user
  async logout(userId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Remove refresh token
    user.refreshToken = undefined;
    await user.save();
  }
}

export default new AuthService();
