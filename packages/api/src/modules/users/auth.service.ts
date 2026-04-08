import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from './user.repository.js';
import { eventBus } from '../../shared/event-bus/event-bus.js';
import { LoginFailedEvent } from '../../shared/event-bus/events.js';

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async register(data: { email: string; password: string; name: string }) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw Object.assign(new Error('Email already registered'), { status: 400, code: 'EMAIL_EXISTS' });

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await this.userRepo.create({ ...data, password: hashed });
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401, code: 'INVALID_CREDENTIALS' });

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw Object.assign(new Error('Account locked'), { status: 401, code: 'ACCOUNT_LOCKED' });
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      const attempts = user.loginAttempts + 1;
      const locked = attempts >= 5;
      await this.userRepo.updateLoginAttempts(user.id, attempts, locked ? new Date(Date.now() + 900000) : null);
      if (locked) {
        eventBus.emit<LoginFailedEvent>({ type: 'LoginFailed', email: user.email, attempts, locked: true, timestamp: new Date().toISOString() });
      }
      throw Object.assign(new Error('Invalid credentials'), { status: 401, code: 'INVALID_CREDENTIALS' });
    }

    await this.userRepo.updateLoginAttempts(user.id, 0, null);
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async refreshToken(token: string) {
    const record = await this.userRepo.findRefreshToken(token);
    if (!record || record.expiresAt < new Date()) {
      throw Object.assign(new Error('Invalid refresh token'), { status: 401, code: 'INVALID_TOKEN' });
    }
    await this.userRepo.deleteRefreshToken(token);
    const user = record.user;
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async logout(userId: string) {
    await this.userRepo.deleteAllRefreshTokens(userId);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign({ userId, email, role }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as jwt.SignOptions);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.userRepo.createRefreshToken(userId, refreshToken, expiresAt);
    return { token: accessToken, refreshToken };
  }
}
