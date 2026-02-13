import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { AuthService } from "../services/auth.service";
import { throwError } from "../middleware/errorHandler";
import { ApiResponse } from "../types";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, password, passwordConfirm } = req.body;

      // Validation
      if (!email || !username || !password || !passwordConfirm) {
        throwError(
          400,
          "Email, username, password, and passwordConfirm are required",
        );
      }

      if (password !== passwordConfirm) {
        throwError(400, "Passwords do not match");
      }

      if (password.length < 8) {
        throwError(400, "Password must be at least 8 characters");
      }

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
      });

      if (existingUser) {
        throwError(409, "Email or username already exists");
      }

      // Determine role: First user is admin, others are viewers
      const userCount = await User.countDocuments();
      const role = userCount === 0 ? "admin" : "viewer";

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        username,
        passwordHash: password,
        role: role,
        isActive: true,
      });

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = AuthService.generateTokenPair(
        user._id.toString(),
        user.email,
        user.role,
      );

      // Set refresh token in httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const response: ApiResponse<any> = {
        success: true,
        message: "User registered successfully",
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        throwError(400, "Email and password are required");
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user || !(await user.comparePassword(password))) {
        throwError(401, "Invalid email or password");
      }

      if (!user.isActive) {
        throwError(403, "User account is inactive");
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = AuthService.generateTokenPair(
        user._id.toString(),
        user.email,
        user.role,
      );

      // Set refresh token in httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const response: ApiResponse<any> = {
        success: true,
        message: "Login successful",
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (!refreshToken) {
        throwError(400, "Refresh token is required");
      }

      // Verify refresh token
      const decoded = AuthService.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.sub);

      if (!user || !user.isActive) {
        throwError(401, "Invalid refresh token or user");
      }

      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        AuthService.generateTokenPair(
          user._id.toString(),
          user.email,
          user.role,
        );

      // Update cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const response: ApiResponse<any> = {
        success: true,
        message: "Token refreshed",
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("refreshToken");

      const response: ApiResponse<null> = {
        success: true,
        message: "Logout successful",
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user?.id);

      if (!user) {
        throwError(404, "User not found");
      }

      const response: ApiResponse<any> = {
        success: true,
        message: "User data retrieved",
        data: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
