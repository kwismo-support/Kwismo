export const env = {
  /**
   * Variable de contrôle permettant de basculer librement entre les données mockées
   * et l'API réelle du backend FastAPI.
   * - true : utilise les données mockées structurées selon Prisma/FastAPI
   * - false : effectue les vrais appels HTTP vers l'API backend
   */
  USE_MOCK_DATA: process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false',

  /**
   * URL de base de l'API FastAPI backend
   */
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:7001/api/v1',

  /**
   * Clé de stockage JWT Token local
   */
  AUTH_TOKEN_KEY: 'kwismo_jwt_access_token',
};
