import { z } from 'zod';

export const createPartnerSchema = z.object({
  nom_entreprise: z.string().min(2, 'partners.validation.companyNameMin'),
  type_partenariat: z.string().min(2, 'partners.validation.typeMin'),
  email_contact: z.string().email('partners.validation.invalidEmail').optional(),
  telephone_contact: z.string().optional(),
});

export const addAffiliationRuleSchema = z.object({
  country_id: z.string().min(2, 'partners.validation.countryRequired'),
  prefixes: z.array(z.string()).min(1, 'partners.validation.prefixesRequired'),
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type AddAffiliationRuleInput = z.infer<typeof addAffiliationRuleSchema>;
