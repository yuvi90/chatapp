namespace TokenPayload {
  interface JwtPayload {
    user: { _id: string; username: string; role?: string };
  }
  interface RefreshTokenPayLoad {
    _id: string;
    username: string;
  }
}
