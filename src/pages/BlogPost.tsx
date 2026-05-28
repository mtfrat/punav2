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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white text-foreground flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center px-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Post no encontrado</h1>
          <Link to="/blog" className="text-primary hover:opacity-80 flex items-center gap-2 font-semibold">
            <ChevronLeft size={20} /> Volver al blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Clean description for metatags
  const cleanDescription = post.content
    .replace(/<[^>]*>?/gm, '')
    .substring(0, 160);

  return (
    <div className="min-h-screen bg-white font-body selection:bg-foreground selection:text-background">
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
        customSchema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `https://www.puna-tech.com/blog/${post.id}/#post`,
          "headline": post.title,
          "image": post.image_url || 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop',
          "datePublished": post.created_at,
          "dateModified": post.created_at,
          "author": {
            "@type": "Organization",
            "name": "Puna Tech",
            "url": "https://www.puna-tech.com/"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Puna Tech",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.puna-tech.com/darkLogo.png"
            }
          },
          "description": cleanDescription
        }}
      />
      <Navbar />
      
      <main className="pt-40 pb-32">
        <div className="max-w-4xl mx-auto px-8">
          {/* Back button */}
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors mb-12 group font-semibold text-sm"
          >
            <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-1" />
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-8 leading-[1.08] tracking-tight text-foreground">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-foreground/50 border-y border-foreground/10 py-6 text-xs uppercase tracking-wider font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span>
                    {new Date(post.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  <span>Puna Team</span>
                </div>
                
                <div className="flex items-center gap-2 sm:ml-auto relative">
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
                    aria-label="Compartir artículo"
                  >
                    <Share2 size={16} />
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
                className="mb-12 rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl shadow-foreground/5 border border-foreground/5"
              >
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
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
                className="prose max-w-none 
                  prose-p:text-base prose-p:leading-relaxed prose-p:text-foreground/80
                  prose-headings:font-display prose-headings:text-foreground prose-headings:tracking-tight
                  prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4
                  prose-a:text-primary prose-a:underline hover:prose-a:opacity-80
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-foreground/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                  prose-ul:list-disc prose-ul:pl-6
                  prose-ol:list-decimal prose-ol:pl-6
                  prose-li:my-2 prose-li:text-foreground/80
                  prose-img:rounded-[2rem] prose-img:shadow-2xl"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </motion.div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
