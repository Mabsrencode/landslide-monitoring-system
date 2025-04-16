class AuthService {
  private static instance: AuthService;
  public static getInstance = () => {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  };
}
