import { config } from '../config/env.js';
import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import * as authService from '../services/authService.js';
import { userRepository } from '../repositories/userRepository.js';
import { recordAudit } from '../middlewares/audit.js';
import { unauthorized, forbidden } from '../errors/AppError.js';

const REFRESH_COOKIE = 'pt_refresh';

/** Refresh cookie is scoped to the auth routes so it isn't sent on every request. */
const cookieOptions = () => ({
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: config.refreshTtlMs,
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.valid.body;
  const { user, accessToken, refreshToken } = await authService.loginWithGoogle({
    credential,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  recordAudit(req, { action: 'auth.login', entity: 'User', entityId: user.id });
  sendData(res, { user, accessToken });
});

export const devLogin = asyncHandler(async (req, res) => {
  if (config.isProd || !config.ALLOW_DEV_LOGIN) throw forbidden('Demo login is disabled');
  const { user, accessToken, refreshToken } = await authService.devLogin({
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  recordAudit(req, { action: 'auth.devlogin', entity: 'User', entityId: user.id });
  sendData(res, { user, accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshSession({
    refreshToken: req.cookies?.[REFRESH_COOKIE],
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions());
  sendData(res, { user: result.user, accessToken: result.accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout({ refreshToken: req.cookies?.[REFRESH_COOKIE] });
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(), maxAge: undefined });
  recordAudit(req, { action: 'auth.logout' });
  sendData(res, { ok: true });
});

export const me = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  if (!user) throw unauthorized();
  sendData(res, { user });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await userRepository.updatePreferences(req.user.id, req.valid.body);
  sendData(res, { user });
});
