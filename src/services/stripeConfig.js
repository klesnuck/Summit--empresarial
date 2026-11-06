// Configuración de Stripe
// En producción o pruebas reales, coloca tu clave pública:
// VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TU_CLAVE_PUBLICA_STRIPE';

export const isStripeConfigured = () => {
  return (
    STRIPE_PUBLISHABLE_KEY &&
    !STRIPE_PUBLISHABLE_KEY.includes('TU_CLAVE_PUBLICA')
  );
};

export const EVENT_DETAILS = {
  price: 350.00,
  currency: 'MXN',
  name: 'Summit Empresarial México - Acceso Completo'
};

