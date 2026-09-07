import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Icon } from '@iconify/react';
import ContactBar from '@/features/landing/components/ContactBar';
import Navbar from '@/features/landing/components/Navbar';
import Footer from '@/features/landing/components/Footer';
import { PhoneInput } from '@/shared/ui/phone-input';
import { partnerRequestsStore } from '@/features/partners/services/partnerRequestsStore';
import { authApi } from '@/features/auth/services/auth.api';

interface FormInputs {
  nomEntreprise: string;
  nomContact: string;
  email: string;
  telephone: string;
  typePartenariat: string;
  pays: string;
  message?: string;
}

export default function PartnerRequestPage() {
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormInputs | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      typePartenariat: '',
      pays: 'Cameroun',
    },
  });

  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    try {
      // Split nomContact into nom/prenom for backend consistency
      const nameParts = data.nomContact.trim().split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || prenom;

      // Save to pending partner requests store
      partnerRequestsStore.addRequest({
        nomEntreprise: data.nomEntreprise,
        typePartenariat: data.typePartenariat || 'mno',
        nomContact: nom,
        prenomContact: prenom,
        email: data.email,
        telephone: data.telephone,
        message: data.message ? `[Pays: ${data.pays}] ${data.message}` : `[Pays: ${data.pays}]`,
      });

      await authApi.registerPartner({
        nomEntreprise: data.nomEntreprise,
        typePartenariat: data.typePartenariat as any,
        nomContact: nom,
        prenomContact: prenom,
        email: data.email,
        telephone: data.telephone,
        message: data.message,
      });

      setSubmittedData(data);
    } catch {
      // Toast handles error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-[#0F1626] font-body text-slate-900 dark:text-white transition-colors duration-200">
      <ContactBar />
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl flex flex-col items-center">
          {/* Header Title Block */}
          <span className="text-brand-orange text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 text-center">
            PARTENARIAT
          </span>

          <h1 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center">
            Devenir partenaire KWISMO
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl text-center leading-relaxed">
            Rejoignez l'écosystème KWISMO et protégez vos clients contre la fraude Mobile Money. Notre équipe vous contactera sous 48h.
          </p>

          {/* Form Card */}
          <div className="mt-10 w-full max-w-3xl bg-white dark:bg-[#161E33] rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl p-6 sm:p-10 transition-all">
            {submittedData ? (
              <div className="flex flex-col items-center text-center py-8 px-4 gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white shadow-lg">
                  <Icon icon="solar:check-circle-bold" className="text-4xl" />
                </div>
                <h3 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
                  Demande de partenariat transmise !
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                  Merci ! Votre demande pour <strong className="text-brand-green font-semibold">{submittedData.nomEntreprise}</strong> a bien été enregistrée. Elle est désormais <strong className="text-brand-orange font-semibold">en attente de validation par le Super Administrateur</strong>. Notre équipe vous contactera sous 48h.
                </p>
                <a
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-brand-green text-white text-xs font-semibold hover:bg-brand-green/90 shadow-md transition"
                >
                  <Icon icon="solar:arrow-left-linear" className="text-base" />
                  <span>Retour à l'accueil</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Nom de l'entreprise <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MTN Cameroun"
                      className="h-11 sm:h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition"
                      {...register('nomEntreprise', { required: true })}
                    />
                    {errors.nomEntreprise && <span className="text-[11px] text-rose-500">Champ requis</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Nom du contact <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nom Prénom"
                      className="h-11 sm:h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition"
                      {...register('nomContact', { required: true })}
                    />
                    {errors.nomContact && <span className="text-[11px] text-rose-500">Champ requis</span>}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Email professionnel <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contact@co.com"
                      className="h-11 sm:h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition"
                      {...register('email', { required: true })}
                    />
                    {errors.email && <span className="text-[11px] text-rose-500">Champ requis</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Controller
                      name="telephone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          label="Téléphone"
                          required
                          value={field.value ?? ''}
                          onChange={(val) => field.onChange(val)}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Type de partenariat <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      className="h-11 sm:h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition cursor-pointer"
                      {...register('typePartenariat', { required: true })}
                    >
                      <option value="" disabled>Choisir...</option>
                      <option value="mno">Opérateur Télécom (MNO)</option>
                      <option value="bank">Banque & Établissement de crédit</option>
                      <option value="fintech">Fintech & Agrégateur</option>
                      <option value="microfinance">Microfinance</option>
                      <option value="merchant">Marchand & Grande Entreprise</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Pays <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      className="h-11 sm:h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition cursor-pointer"
                      {...register('pays', { required: true })}
                    >
                      <option value="" disabled>Choisir...</option>
                      <option value="Cameroun">Cameroun</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Sénégal">Sénégal</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Congo">Congo</option>
                      <option value="RDC">République Démocratique du Congo</option>
                      <option value="Togo">Togo</option>
                      <option value="Bénin">Bénin</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Mali">Mali</option>
                      <option value="Guinée">Guinée</option>
                      <option value="Niger">Niger</option>
                      <option value="France">France</option>
                      <option value="États-Unis">États-Unis</option>
                      <option value="Royaume-Uni">Royaume-Uni</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Message (optionnel)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez votre besoin..."
                    className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition resize-none"
                    {...register('message')}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 items-center gap-2.5 rounded-xl bg-[#4C64AC] hover:bg-[#3E528F] px-7 text-xs sm:text-sm font-semibold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    <Icon icon="solar:plain-bold" className="text-lg" />
                    <span>{loading ? 'Traitement en cours...' : 'Envoyer la demande'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
