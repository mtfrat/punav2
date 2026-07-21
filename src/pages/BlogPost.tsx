import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Calendar, User, Share2, List, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOTags from '../components/SEO/SEOTags';
import { supabase, translatePostTitle } from '../lib/supabase';
import { BLOG_ARTICLES, LEGACY_POST_MAPPING } from '../data';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author?: string;
  category?: string;
  created_at: string;
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Check legacy mapping first
      const resolvedId = LEGACY_POST_MAPPING[id] || id;

      // If mapped to a different canonical slug, redirect seamlessly
      if (LEGACY_POST_MAPPING[id]) {
        navigate(`/blog/${resolvedId}`, { replace: true });
        return;
      }

      // 1. Check static local BLOG_ARTICLES first
      const localArticle = BLOG_ARTICLES.find(a => a.id === resolvedId);
      if (localArticle) {
        setPost({
          id: localArticle.id,
          title: localArticle.title,
          content: localArticle.content,
          image_url: localArticle.imageUrl,
          author: localArticle.author,
          category: localArticle.category,
          created_at: '2026-06-01T00:00:00.000Z'
        });
        setLoading(false);
        return;
      }

      // 2. Query Supabase as secondary source
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', resolvedId)
          .single();

        if (error) throw error;
        
        if (data) {
          data.title = translatePostTitle(data.id, data.title);
          setPost(data);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  // Extract Table of Contents from headings in markdown content
  useEffect(() => {
    if (!post?.content) return;
    const headingLines = post.content.split('\n').filter(line => line.startsWith('## ') || line.startsWith('### '));
    const extractedToc = headingLines.map((line, idx) => {
      const isH3 = line.startsWith('### ');
      const text = line.replace(/^###?\s+/, '').replace(/\*\*/g, '').trim();
      const slug = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return {
        id: slug || `section-${idx}`,
        text,
        level: isH3 ? 3 : 2
      };
    });
    setToc(extractedToc);
  }, [post]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20 border-t-white"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <>
        <SEOTags 
          title="Artículo no encontrado | Puna Tech Blog"
          description="El artículo solicitado no existe o ha sido movido."
          robots="noindex, follow"
        />
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center px-8 py-32">
          <h1 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight mb-4">Artículo no encontrado</h1>
          <p className="text-white/60 mb-8 max-w-md text-center">No hemos podido localizar la publicación solicitada. Explora nuestras últimas publicaciones sobre agentes e Inteligencia Artificial.</p>
          <Link to="/blog" className="text-white/80 hover:text-white transition-colors flex items-center gap-2 font-semibold uppercase tracking-wider text-sm border border-white/10 bg-white/5 px-6 py-3 rounded-full">
            <ChevronLeft size={16} /> Volver al Blog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  // Clean description for metatags
  const cleanDescription = post.content
    .replace(/<[^>]*>?/gm, '')
    .replace(/^>\s*\*\*TL;DR\*\*:\s*/i, '')
    .substring(0, 155);

  const canonicalUrl = `https://www.puna-tech.com/blog/${post.id}`;

  return (
    <>
      <SEOTags 
        title={`${post.title} | Puna Tech`}
        description={cleanDescription}
        article={true}
        ogTitle={post.title}
        ogDescription={cleanDescription}
        ogImage={post.image_url}
        canonicalUrl={canonicalUrl}
        breadcrumbs={[
          { name: 'Inicio', url: 'https://www.puna-tech.com/' },
          { name: 'Blog', url: 'https://www.puna-tech.com/blog' },
          { name: post.title, url: canonicalUrl }
        ]}
        customSchema={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": post.title,
          "description": cleanDescription,
          "image": post.image_url || "https://www.puna-tech.com/og-image.png",
          "datePublished": post.created_at,
          "dateModified": post.created_at,
          "author": {
            "@type": "Person",
            "name": post.author || "Ing. Martín Fraticelli",
            "jobTitle": "Lead AI Engineer",
            "worksFor": {
              "@type": "Organization",
              "name": "Puna Tech"
            }
          },
          "publisher": {
            "@type": "Organization",
            "name": "Puna Tech",
            "url": "https://www.puna-tech.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.puna-tech.com/profile-picture.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        }}
      />
      <Navbar />
      
      <main className="flex-grow pt-32 pb-32">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          {/* Back button */}
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group font-semibold text-xs uppercase tracking-wider"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Volver al blog
          </Link>

          <article>
            {/* Header */}
            <motion.header 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              {post.category && (
                <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-[4px] text-[10px] font-mono font-bold uppercase tracking-widest mb-4 inline-block">
                  {post.category}
                </span>
              )}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extralight uppercase text-white tracking-tight mb-8 leading-[1.08]">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/50 border-y border-white/10 py-6 text-[10px] uppercase tracking-widest font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-white/80" />
                  <span>
                    {new Date(post.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-white/80" />
                  <span>{post.author || 'Puna Team'}</span>
                </div>
                
                <div className="flex items-center gap-2 sm:ml-auto relative">
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                    aria-label="Compartir artículo"
                  >
                    <Share2 size={14} />
                    <span>{shared ? '¡Copiado!' : 'Compartir'}</span>
                  </button>
                </div>
              </div>
            </motion.header>

            {/* Featured Image */}
            {post.image_url && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12 rounded-lg overflow-hidden aspect-video border border-white/10 relative"
              >
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#050505]/10"></div>
              </motion.div>
            )}

            {/* Table of Contents for Sitelinks & Navigation */}
            {toc.length > 0 && (
              <div className="mb-12 p-6 bg-[#0c0c0c] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-widest mb-4">
                  <List size={16} className="text-white/70" />
                  <span>Tabla de Contenidos & Directivas</span>
                </div>
                <ul className="space-y-2">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? 'ml-4' : ''}>
                      <a 
                        href={`#${item.id}`} 
                        className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <ArrowRight size={12} className="text-white/40 shrink-0" />
                        <span>{item.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content Body */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="puna-blog-content"
            >
              <div 
                className="prose prose-invert max-w-none 
                  prose-p:text-sm prose-p:leading-relaxed prose-p:text-white/70 prose-p:font-light
                  prose-headings:font-light prose-headings:uppercase prose-headings:text-white prose-headings:tracking-wide
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-a:text-white prose-a:underline hover:prose-a:opacity-80
                  prose-blockquote:border-l-4 prose-blockquote:border-white/30 prose-blockquote:bg-white/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
                  prose-table:w-full prose-table:my-8 prose-table:border-collapse prose-th:bg-white/10 prose-th:p-3 prose-th:text-xs prose-th:text-white prose-td:p-3 prose-td:border-t prose-td:border-white/10 prose-td:text-xs prose-td:text-white/70
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:text-white/70 prose-ul:text-sm prose-ul:font-light
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-white/70 prose-ol:text-sm prose-ol:font-light
                  prose-li:my-2
                  prose-img:rounded-lg prose-img:border prose-img:border-white/10"
                dangerouslySetInnerHTML={{ 
                  __html: post.content
                    .replace(/^> \*\*(TL;DR.*?)\*\*/m, '<div className="p-4 mb-8 bg-white/5 border-l-4 border-white text-white/90 text-sm leading-relaxed rounded-r-lg"><strong>$1</strong></div>')
                    .replace(/## (.*?)\n/g, (_, title) => {
                      const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return `<h2 id="${slug}">${title}</h2>\n`;
                    })
                }} 
              />
            </motion.div>
          </article>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
