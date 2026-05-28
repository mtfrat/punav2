import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOTags from '../components/SEO/SEOTags';
import { supabase, translatePostTitle } from '../lib/supabase';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  category?: string;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedPosts = (data || []).map(post => ({
        ...post,
        title: translatePostTitle(post.id, post.title)
      }));
      
      setPosts(mappedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white font-body selection:bg-foreground selection:text-background">
      <SEOTags 
        title="Blog - Insights sobre Automatización y GTM | Puna Tech"
        description="Exploramos la intersección entre ingeniería, inteligencia artificial y crecimiento de negocios en el blog de Puna Tech."
        canonicalUrl="https://www.puna-tech.com/blog"
        breadcrumbs={[
          { name: 'Inicio', url: 'https://www.puna-tech.com/' },
          { name: 'Blog', url: 'https://www.puna-tech.com/blog' }
        ]}
        customSchema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": "https://www.puna-tech.com/blog/#webpage",
          "url": "https://www.puna-tech.com/blog",
          "name": "Blog - Insights sobre Automatización y GTM | Puna Tech",
          "description": "Exploramos la intersección entre ingeniería, inteligencia artificial y crecimiento de negocios en el blog de Puna Tech."
        }}
      />
      <Navbar />
      
      <main className="pt-40 pb-32 px-4 sm:px-8 md:px-12 2xl:px-20 bg-background text-foreground">
        <div className="w-full max-w-none mx-auto">
          {/* Header */}
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 bg-foreground/5 border border-foreground/10 rounded-full px-4 py-1.5 mb-8 inline-flex"
            >
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                 <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 0L6.12257 3.87743L10 5L6.12257 6.12257L5 10L3.87743 6.12257L0 5L3.87743 3.87743L5 0Z" fill="white"/>
                 </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-60">Diario</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-display tracking-tight mb-8">
              Descubre nuestro <em className="italic opacity-60">Laboratorio</em>
            </h1>
            <p className="max-w-xl mx-auto text-foreground/40 font-body text-sm">
              Exploramos la intersección entre ingeniería, inteligencia artificial y crecimiento de negocios.
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group cursor-pointer bg-slate-50 p-6 rounded-[2.5rem] border border-black/5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 flex flex-col justify-between"
                  >
                    <Link to={`/blog/${post.id}`} className="block w-full flex-grow flex flex-col">
                      <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden mb-6">
                        <img 
                          src={post.image_url || 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop'} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" 
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-primary text-white text-[8px] font-bold uppercase tracking-widest rounded-full">
                            {post.category || 'Insights'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4 px-2 flex flex-col items-center md:items-start text-center md:text-left flex-grow">
                         <div className="flex items-center gap-4 text-[10px] text-foreground/40 font-semibold uppercase tracking-wider">
                           <span className="flex items-center gap-1">
                             <Calendar size={12} />
                             {new Date(post.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                           </span>
                           <span className="flex items-center gap-1">
                             <User size={12} />
                             Puna Team
                           </span>
                         </div>
                         
                         <h2 className="text-2xl font-display tracking-tight text-foreground leading-[1.1] group-hover:text-primary transition-colors">
                           {post.title}
                         </h2>
                         <p 
                           className="text-xs text-foreground/40 leading-relaxed font-body line-clamp-3"
                           dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' }}
                         />
                      </div>
                    </Link>
                    
                    <div className="mt-6 px-2 w-full flex justify-center md:justify-start">
                      <Link 
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Leer más
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {posts.length === 0 && (
                <div className="text-center py-20 text-foreground/40 font-body text-sm">
                  No hay artículos publicados todavía en el laboratorio.
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
