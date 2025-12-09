import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
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
        profilePicture: user.profilePicture,
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
        profilePicture: user.profilePicture,
        xp: user.xp,
        level: user.level,
        streak: user.streak?.current || 0,
      },
      accessToken,
      refreshToken,
    };
  }

  // Google Login
  async loginWithGoogle(idToken: string): Promise<IAuthResponse> {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new ApiError(500, 'Google Client ID is not configured');
    }

    const client = new OAuth2Client(googleClientId);

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new ApiError(401, 'Invalid Google Token');
      }

      const { email, name, picture, sub: googleId } = payload;

      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        // If user exists, but no googleId (merged account logic could go here)
        if (!user.googleId) {
          user.googleId = googleId;
          if (picture && !user.profilePicture) {
            user.profilePicture = picture;
          }
          await user.save();
        }
      } else {
        // Create new user
        user = await User.create({
          email,
          name: name || 'Google User',
          profilePicture: picture,
          googleId,
          authProvider: 'google',
          role: 'learner', // Default role
          isActive: true,
          // Preferences - defaults will be applied
          preferences: {
            interests: [],
            goals: [],
            dailyLearningTime: 30,
            preferredDifficulty: 'beginner',
            language: 'en',
          },
          // Gamification - defaults will be applied
          xp: 0,
          coins: 0,
          level: 1,
          streak: {
            current: 0,
            longest: 0,
          },
          badges: [],
        });
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Your account has been deactivated');
      }

      // Generate tokens
      const jwtPayload: IJwtPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = this.generateAccessToken(jwtPayload);
      const refreshToken = this.generateRefreshToken(jwtPayload);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
          xp: user.xp,
          level: user.level,
          streak: user.streak?.current || 0,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error("Google Login Error:", error);
      throw new ApiError(401, 'Google authentication failed');
    }
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

  // Get current user
  async getMe(userId: string) {
    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      profilePicture: user.profilePicture,
      xp: user.xp,
      level: user.level,
      streak: user.streak?.current || 0,
      isActive: user.isActive,
    };
  }
}

export default new AuthService();
