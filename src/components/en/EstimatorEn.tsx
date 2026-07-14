import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw
} from "lucide-react";

const EstimatorEn = () => {
  const [projectType, setProjectType] = useState("Web Platform");
  const [stage, setStage] = useState("I have an idea");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | ''>('');

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !email.trim() || !name.trim()) {
      return;
    }

    setLoading(true);
    setSubmitStatus('');

    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_yy0g002';
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_cr5obtd';
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'uTD7ft0fVaE7j9YlO';

    try {
      const templateParams = {
        from_name: name,
        from_email: email,
        company: company || 'Not specified',
        message: `AI Estimator (EN):\n- Type: ${projectType}\n- Stage: ${stage}\n- Name: ${name}\n- Company: ${company}\n- Email: ${email}\n- Description: ${description}`,
        to_name: 'PunaTech',
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus('success');
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const resetEstimator = () => {
    setProjectType("Web Platform");
    setStage("I have an idea");
    setDescription("");
    setEmail("");
    setName("");
    setCompany("");
    setSubmitStatus('');
  };

  return (
    <section id="estimador" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-white/[0.02] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-white/[0.01] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
              <Calculator className="w-4 h-4 text-white/80" />
              <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase">
                Request a Quote
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight leading-tight">
              Calculate the budget for <br />
              <span className="font-normal text-white">
                your next project
              </span>
              .
            </h2>
            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl font-light">
              Instantly discover how much it would cost to develop your MVP, platform or autonomous agent assistant. Complete your details to schedule a strategy session and receive a real breakdown.
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/50 pt-4 font-light">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                <span>Personalized technical estimation.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                <span>Budget breakdown and phased roadmap.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                <span>15-minute discovery session at no cost.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {loading && (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-8 md:p-12 flex flex-col items-center justify-center min-h-[480px] backdrop-blur-md relative overflow-hidden">
                <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-white text-base md:text-lg font-light uppercase tracking-wider text-center mb-2">
                  Processing request...
                </p>
              </div>
            )}

            {!loading && submitStatus === '' && (
              <form
                onSubmit={handleCalculate}
                className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 backdrop-blur-md relative overflow-hidden"
              >
                <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">
                      What do you need to build?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {["Web Platform", "AI Chatbot", "AI Agents System", "Mobile App", "Other"].map(
                        (type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setProjectType(type)}
                            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                              projectType === type
                                ? "bg-white border-white text-black"
                                : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                            }`}
                          >
                            {type}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">
                      What is your current stage?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {["I have an idea", "I have figma/wireframes", "Legacy replacement"].map(
                        (stg) => (
                          <button
                            type="button"
                            key={stg}
                            onClick={() => setStage(stg)}
                            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                              stage === stg
                                ? "bg-white border-white text-black"
                                : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                            }`}
                          >
                            {stg}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs font-semibold text-white tracking-widest uppercase">Full Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex. John Doe" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white font-light"
                        required
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs font-semibold text-white tracking-widest uppercase">Company (Optional)</label>
                      <input 
                        type="text" 
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Your Company" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white font-light"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">Corporate Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white font-light"
                      required
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">
                      Describe your idea
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: I need a web portal to manage appointments that integrates with our database..."
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-none font-light"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Request Proposal
                  </button>
                </div>
              </form>
            )}

            {!loading && submitStatus === 'success' && (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 backdrop-blur-md relative overflow-hidden space-y-6">
                <div className="flex justify-between items-start border-b border-white/5 pb-6">
                  <div>
                    <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block mb-1">
                      Request Sent Successfully
                    </span>
                    <h3 className="text-lg md:text-xl font-light uppercase tracking-wide text-white">
                      Thank you for contacting us!
                    </h3>
                  </div>
                  <button
                    onClick={resetEstimator}
                    className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition-colors uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    New Request
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    We have received your project details ({projectType}). Our engineering team will analyze your request and we will contact you shortly via <strong>{email}</strong> to send you an initial proposal.
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    In the meantime, you can schedule a discovery call anytime using the button in the main menu.
                  </p>
                </div>
              </div>
            )}
            
            {!loading && submitStatus === 'error' && (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 backdrop-blur-md relative overflow-hidden space-y-6">
                <div className="flex items-center gap-3 text-red-400 mb-4">
                  <XCircle className="w-8 h-8" />
                  <h3 className="text-lg md:text-xl font-light uppercase tracking-wide">
                    An error occurred
                  </h3>
                </div>
                <p className="text-sm text-white/60 leading-relaxed font-light">
                  We could not process your request at this time. Please try again later or contact us directly.
                </p>
                <button
                  onClick={resetEstimator}
                  className="mt-4 px-6 py-2 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EstimatorEn;
