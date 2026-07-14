import { X, ArrowLeft, Calendar, User, Sparkles } from "lucide-react";
import { BlogArticle } from "../types";

interface BlogDrawerProps {
  article: BlogArticle;
  onClose: () => void;
}

export default function BlogDrawer({ article, onClose }: BlogDrawerProps) {
  // Simple paragraph/line parser to format text safely without heavy external markdown libraries
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("## ")) {
        return (
          <h4
            key={idx}
            className="text-lg md:text-xl font-light uppercase text-white tracking-wider pt-6 pb-2 border-b border-white/10"
          >
            {trimmed.replace("## ", "")}
          </h4>
        );
      }

      if (trimmed.startsWith("### ")) {
        return (
          <h5 key={idx} className="text-sm font-semibold uppercase tracking-wider text-white/80 pt-4 pb-1">
            {trimmed.replace("### ", "")}
          </h5>
        );
      }

      if (trimmed.startsWith("- ")) {
        // Highlight some words surrounded with ** inside list item
        const rawText = trimmed.replace("- ", "");
        const formatted = parseBoldText(rawText);
        return (
          <li key={idx} className="text-sm text-white/60 list-disc ml-5 leading-relaxed space-y-1 font-light">
            {formatted}
          </li>
        );
      }

      if (trimmed === "---") {
        return <hr key={idx} className="border-white/10 my-6" />;
      }

      if (trimmed !== "") {
        const formatted = parseBoldText(trimmed);
        return (
          <p key={idx} className="text-sm md:text-base text-white/60 leading-relaxed mb-4 font-light">
            {formatted}
          </p>
        );
      }

      return <div key={idx} className="h-2"></div>;
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={i} className="text-white font-bold">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-[#0d0d0d] h-full border-l border-white/10 flex flex-col shadow-2xl overflow-hidden relative">

        {/* Floating Header Actions */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0d0d0d]/90 backdrop-blur-sm z-10 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors uppercase tracking-wider font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Cerrar artículo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Article Body */}
        <div className="flex-grow overflow-y-auto">
          {/* Banner Image */}
          <div className="h-64 md:h-80 w-full overflow-hidden relative border-b border-white/5">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            {/* Absolute overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-black/30"></div>
          </div>

          {/* Content Wrapper */}
          <div className="p-6 md:p-10 space-y-6 relative">
            {/* Metadata and Title */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-0.5 bg-white text-black rounded-[4px] text-[9px] font-mono font-bold uppercase tracking-widest">
                  {article.category}
                </span>
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {article.author}
                </span>
              </div>

              <h3 className="text-2xl md:text-4xl font-light uppercase tracking-wide text-white leading-tight">
                {article.title}
              </h3>
              <p className="text-sm md:text-base text-white/70 leading-relaxed italic border-l border-white/30 pl-4 font-light">
                {article.description}
              </p>
            </div>

            {/* Custom formatted technical content */}
            <div className="pt-6 space-y-2 border-t border-white/10 pb-12">
              {renderFormattedContent(article.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
