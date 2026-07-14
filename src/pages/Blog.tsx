import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ChevronRight } from 'lucide-react';
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
    <>
      <SEOTags 
        title="Blog - Insights sobre Automatización y GTM | Puna Tech"
        description="Exploramos la intersección entre ingeniería, inteligencia artificial y crecimiento de negocios en el blog de Puna Tech."
        canonicalUrl="https://www.puna-tech.com/blog"
        breadcrumbs={[
          { name: 'Inicio', url: 'https://www.puna-tech.com/' },
          { name: 'Blog', url: 'https://www.puna-tech.com/blog' }
        ]}
      />
      <Navbar />
      
      <main className="flex-grow pt-32 pb-32 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-3">
            <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
              Artículos Técnicos &amp; Casos de Estudio
            </span>
            <h1 className="text-4xl md:text-6xl font-extralight uppercase text-white tracking-tight">
              Insights &amp; Visión
            </h1>
            <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
              Exploramos la intersección entre ingeniería, inteligencia artificial y crecimiento de negocios B2B.
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20 border-t-white"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.map((post, idx) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.id}`}
                    className="group bg-[#0d0d0d] border border-white/10 rounded-lg overflow-hidden hover:border-white/30 hover:bg-[#121212] transition-all duration-300 flex flex-col h-[400px]"
                  >
                    {/* Banner image wrapper */}
                    <div className="h-44 overflow-hidden relative shrink-0 border-b border-white/5">
                      <img
                        src={post.image_url || 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-[#050505]/20"></div>
                    </div>

                    {/* Body Info */}
                    <div className="p-5 flex flex-col justify-between flex-grow">
                      <div className="space-y-2">
                        <span className="px-2.5 py-0.5 bg-white text-black rounded-[4px] text-[9px] font-mono font-bold uppercase tracking-widest">
                          {post.category || 'Insights'}
                        </span>
                        <h3 className="text-base font-semibold uppercase tracking-wide text-white group-hover:text-white/80 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p 
                          className="text-xs text-white/50 leading-relaxed line-clamp-3 font-light"
                          dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' }}
                        />
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/40 group-hover:text-white transition-colors pt-3 border-t border-white/5 mt-4">
                        <span>Leer artículo</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {posts.length === 0 && (
                <div className="text-center py-20 text-white/40 font-mono text-sm">
                  No hay artículos publicados todavía en el laboratorio.
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
