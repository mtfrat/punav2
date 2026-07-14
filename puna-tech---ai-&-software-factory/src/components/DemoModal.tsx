import React, { useState } from "react";
import { X, Calendar, Clock, Sparkles, Building, Mail, User, HelpCircle, CheckCircle2 } from "lucide-react";

interface DemoModalProps {
  onClose: () => void;
}

export default function DemoModal({ onClose }: DemoModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [businessNeeds, setBusinessNeeds] = useState("");

  // Business day slots
  const dates = [
    { label: "Mañana, Martes 14 Jul", value: "2026-07-14" },
    { label: "Miércoles 15 Jul", value: "2026-07-15" },
    { label: "Jueves 16 Jul", value: "2026-07-16" },
    { label: "Viernes 17 Jul", value: "2026-07-17" }
  ];
  const [selectedDate, setSelectedDate] = useState(dates[0].value);

  const hours = ["10:00", "11:30", "14:00", "16:30"];
  const [selectedTime, setSelectedTime] = useState(hours[0]);

  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !company) {
      setError("Por favor completa los datos obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          date: selectedDate,
          time: selectedTime,
          businessNeeds
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar el agendamiento.");
      }

      const data = await response.json();
      setBookingResult(data.bookingDetails);
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block mb-1">
                Consultoría B2B Sin Cargo
              </span>
              <h3 className="text-xl md:text-2xl font-light uppercase tracking-wide text-white">
                Agendar Sesión de Descubrimiento
              </h3>
              <p className="text-white/60 text-xs md:text-sm mt-1 leading-relaxed font-light">
                Selecciona tu fecha y hablemos de tu proyecto durante 30 minutos con nuestro equipo técnico principal.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-200 text-xs">
                {error}
              </div>
            )}

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-semibold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-white/70" /> Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Martín Fraticelli"
                  className="bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-white font-light placeholder-white/20"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-semibold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-white/70" /> Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-white font-light placeholder-white/20"
                />
              </div>

              {/* Company */}
              <div className="flex flex-col space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-semibold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-white/70" /> Nombre de tu Empresa
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ej: GlobalLog Solutions"
                  className="bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-white font-light placeholder-white/20"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/70" /> Selecciona el Día
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dates.map((d) => (
                  <button
                    type="button"
                    key={d.value}
                    onClick={() => setSelectedDate(d.value)}
                    className={`p-2.5 rounded-lg border text-[10px] font-semibold transition-all uppercase tracking-wider ${
                      selectedDate === d.value
                        ? "bg-white border-white text-black"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/70" /> Hora Disponible (Hora Local)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {hours.map((h) => (
                  <button
                    type="button"
                    key={h}
                    onClick={() => setSelectedTime(h)}
                    className={`p-2 rounded-lg border text-xs font-mono font-bold tracking-wider transition-all ${
                      selectedTime === h
                        ? "bg-white border-white text-black"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                    }`}
                  >
                    {h} h
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Business Needs */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-semibold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-white/70" /> ¿Qué te gustaría conversar? (Opcional)
              </label>
              <textarea
                value={businessNeeds}
                onChange={(e) => setBusinessNeeds(e.target.value)}
                placeholder="Ej: Automatizar nuestro CRM o reducir tiempos de facturación..."
                className="bg-white/5 border border-white/10 rounded-lg p-3 h-20 text-xs md:text-sm text-white focus:outline-none focus:border-white font-light placeholder-white/20 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Reservando espacio en agenda..." : "Confirmar Sesión Gratuita"}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-white/5 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
                Agendamiento Confirmado
              </span>
              <h3 className="text-xl md:text-2xl font-light uppercase tracking-wide text-white">
                ¡Listo para despegar!
              </h3>
              <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-md mx-auto font-light">
                Hemos bloqueado tu espacio de agenda para el <span className="text-white font-bold">{bookingResult.date}</span> a las <span className="text-white font-bold">{bookingResult.time} h</span>. Te enviamos el enlace de Google Meet a tu correo <span className="text-white underline">{bookingResult.email}</span>.
              </p>
            </div>

            {/* Preparation questions generated by Gemini */}
            {bookingResult.prepQuestions && bookingResult.prepQuestions.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 text-left space-y-3 mt-6">
                <span className="text-xs font-semibold text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-white" />
                  Preguntas sugeridas por la IA
                </span>
                <p className="text-[11px] text-white/40 leading-relaxed font-light">
                  Para aprovechar al máximo los 30 minutos de sesión técnica, te sugerimos preparar respuestas básicas para estas inquietudes sugeridas por nuestro modelo para <span className="text-white font-semibold">{bookingResult.company}</span>:
                </p>
                <ol className="space-y-2.5 pt-3 border-t border-white/5">
                  {bookingResult.prepQuestions.map((q: string, idx: number) => (
                    <li key={idx} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed font-light">
                      <span className="text-white font-bold font-mono shrink-0">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300"
            >
              Entendido / Cerrar Ventana
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
