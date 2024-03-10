export type AuthConfig = {
  secret: string;
  refreshTokenSecret: string;
  audience: string;
  issuer: string;
  accessTokenTTL: number;
  refreshTokenTTL: number;
};
