export type AuthConfig = {
  secret: string;
  audience: string;
  issuer: string;
  accessTokenTTL: number;
  refreshTokenTTL: number;
};
