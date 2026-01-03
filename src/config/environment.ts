import { geheimnisVerwalter } from './secrets/SecretsManagerOptimiert';

export async function loadEnvironmentConfig() {
  const label = process.env.private_label!;
  const pl = await geheimnisVerwalter.holePrivateLabel(label);

  return {
    baseUrl: pl.URL,
    users: {
      default: {
        email: pl.USER_MAIL,
        password: pl.USER_PASSWORD,
      },
    },
    environment: pl.ENVIRONMENT,
    auth: pl.BASE_AUTH,
  };
}
