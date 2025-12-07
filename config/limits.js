export const  limits = {
  Free: {
    invoiceLimit: 20,
    customerLimit: 20,
    emailLimit: 10,
    allowLogo: false,
    allowTemplates: 1,
  },
  Pro: {
    invoiceLimit: Infinity,
    customerLimit: Infinity,
    emailLimit: Infinity,
    allowLogo: true,
    allowTemplates: 10,
  },
};
