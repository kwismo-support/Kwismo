import { Send } from 'lucide-react';

export default function DownloadCTA() {
  return (
    <section
      id="contact"
      className="w-full bg-[#EBF7F2] px-6 py-[42px]"
    >
      <div className="mx-auto max-w-[650px]">

        {/* En-tête */}
        <div className="text-center">
          <h2 className="font-title text-[28px] font-bold leading-[40px] text-[#151D34]">
            Une question ? Une idée ?
          </h2>

          <p className="font-body mt-1 text-[12px] font-normal leading-[16px] text-[#87919F]">
            Notre équipe est disponible pour répondre à toutes vos questions.
          </p>
        </div>

        {/* Formulaire */}
        <form className="mt-5 space-y-3">

          {/* Nom + Email */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

            <input
              type="text"
              name="name"
              placeholder="Votre nom"
              className="font-body h-[30px] w-full rounded-[7px] border border-[#E1E5E8] bg-white px-3 text-[10px] text-[#151D34] outline-none placeholder:text-[#9CA3AF] focus:border-[#31B58A]"
            />

            <input
              type="email"
              name="email"
              placeholder="Votre adresse email"
              className="font-body h-[30px] w-full rounded-[7px] border border-[#E1E5E8] bg-white px-3 text-[10px] text-[#151D34] outline-none placeholder:text-[#9CA3AF] focus:border-[#31B58A]"
            />

          </div>

          {/* Sujet */}
          <input
            type="text"
            name="subject"
            placeholder="Sujet"
            className="font-body h-[30px] w-full rounded-[7px] border border-[#E1E5E8] bg-white px-3 text-[10px] text-[#151D34] outline-none placeholder:text-[#9CA3AF] focus:border-[#31B58A]"
          />

          {/* Label message */}
          <label className="font-body block text-[10px] font-semibold leading-[16px] text-[#151D34]">
            Message
          </label>

          {/* Message */}
          <textarea
            name="message"
            rows={4}
            className="font-body block w-full resize-none rounded-[7px] border border-[#E1E5E8] bg-white px-3 py-2 text-[10px] text-[#151D34] outline-none placeholder:text-[#9CA3AF] focus:border-[#31B58A]"
          />

          {/* Bouton */}
          <button
            type="submit"
            className="font-body flex h-[30px] w-full items-center justify-center gap-2 rounded-[7px] bg-[#31B58A] text-[10px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Send size={10} />
            Envoyer le message
          </button>

        </form>

      </div>
    </section>
  );
}