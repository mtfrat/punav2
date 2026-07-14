import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from "lucide-react";
import { supabase, translatePostTitle } from '../lib/supabase';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  category?: string;
  created_at: string;
}

const BlogHome = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(3);

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

    fetchPosts();
  }, []);
  return (
    <section id="blog" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4">
          <div className="space-y-3">
            <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
              Artículos Técnicos &amp; Casos de Estudio
            </span>
            <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight">
              Insights &amp; Visión
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-xl leading-relaxed font-light">
              Perspectivas sobre el impacto de la Inteligencia Artificial en los negocios y el futuro del desarrollo de software B2B.
            </p>
          </div>
          <Link
            to="/blog"
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 border border-white/10 px-4 py-2 rounded-full transition-colors uppercase tracking-wider font-semibold whitespace-nowrap"
          >
            Ver todos los artículos
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/20 border-t-white"></div>
            </div>
          ) : (
            posts.map((article) => (
            <Link
              key={article.id}
              to={`/blog/${article.id}`}
              className="group bg-[#0d0d0d] border border-white/10 rounded-lg overflow-hidden hover:border-white/30 hover:bg-[#121212] transition-all duration-300 flex flex-col h-[400px]"
            >
              {/* Banner image wrapper */}
              <div className="h-44 overflow-hidden relative shrink-0 border-b border-white/5">
                <img
                  src={article.image_url || 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop'}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-[#050505]/20"></div>
              </div>

              {/* Body Info */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 bg-white text-black rounded-[4px] text-[9px] font-mono font-bold uppercase tracking-widest">
                    {article.category}
                  </span>
                  <h3 className="text-base font-semibold uppercase tracking-wide text-white group-hover:text-white/80 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p 
                    className="text-xs text-white/50 leading-relaxed line-clamp-3 font-light"
                    dangerouslySetInnerHTML={{ __html: article.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' }}
                  />
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/40 group-hover:text-white transition-colors pt-3 border-t border-white/5 mt-4">
                  <span>Leer artículo</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogHome;
