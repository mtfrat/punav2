import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Calendar, User, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOTags from '../components/SEO/SEOTags';
import { supabase, translatePostTitle } from '../lib/supabase';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          data.title = translatePostTitle(data.id, data.title);
        }
        
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

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
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center px-8">
          <h1 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight mb-4">Post no encontrado</h1>
          <Link to="/blog" className="text-white/60 hover:text-white transition-colors flex items-center gap-2 font-semibold uppercase tracking-wider text-sm border border-white/10 bg-white/5 px-4 py-2 rounded-full">
            <ChevronLeft size={16} /> Volver al blog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  // Clean description for metatags
  const cleanDescription = post.content
    .replace(/<[^>]*>?/gm, '')
    .substring(0, 160);

  return (
    <>
      <SEOTags 
        title={`${post.title} | Puna Tech Blog`}
        description={cleanDescription}
        article={true}
        ogTitle={post.title}
        ogDescription={cleanDescription}
        ogImage={post.image_url}
        canonicalUrl={`https://www.puna-tech.com/blog/${post.id}`}
        breadcrumbs={[
          { name: 'Inicio', url: 'https://www.puna-tech.com/' },
          { name: 'Blog', url: 'https://www.puna-tech.com/blog' },
          { name: post.title, url: `https://www.puna-tech.com/blog/${post.id}` }
        ]}
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
                  <span>Puna Team</span>
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
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:text-white/70 prose-ul:text-sm prose-ul:font-light
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-white/70 prose-ol:text-sm prose-ol:font-light
                  prose-li:my-2
                  prose-img:rounded-lg prose-img:border prose-img:border-white/10"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </motion.div>
          </article>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
