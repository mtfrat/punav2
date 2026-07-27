import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase, translatePostTitle, getArticleExcerpt } from '../lib/supabase';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

const defaultPosts: Post[] = [
  {
    id: 'orquestacion-multi-agente',
    title: 'Orquestación Multi-Agente: Cómo Diseñar Arquitecturas de IA que Cooperan Sin Entrar en Loops Infinitos',
    content: 'Diseñar sistemas con múltiples agentes autónomos requiere un manejo sofisticado de estados y ciclos. En esta guía técnica, analizamos cómo implementar patrones de comunicación asíncronos y semáforos de tokens para evitar la redundancia operativa en procesos corporativos.',
    image_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'guardrails-seguridad-ia',
    title: 'Más Allá del Prompting: Implementación de Sistemas de Validación y Guardrails en Entornos Agénticos Corporativos',
    content: 'La seguridad en aplicaciones que utilizan Modelos de Lenguaje va más allá de un buen prompt. Descubre cómo estructurar capas de validación sintáctica y semántica basadas en esquemas JSON y herramientas como LlamaGuard para evitar inyecciones de código.',
    image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'integracion-cloud-agentes',
    title: 'Integración Cloud de Agentes de IA: Guía Práctica para Conectar Modelos de Lenguaje con Bases de Datos y APIs Internas Securitizadas',
    content: 'Desplegar un agente en producción implica conectarlo con la infraestructura existente de la empresa de forma segura. Analizamos el diseño de túneles API securizados, políticas de mínimos privilegios en base de datos y orquestación serverless.',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  }
];

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPosts = async () => {
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
        
        if (mappedPosts.length === 0) {
          setPosts(defaultPosts);
        } else {
          setPosts(mappedPosts);
        }
      } catch (err) {
        console.error('Error fetching latest posts:', err);
        setPosts(defaultPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, []);

  return (
    <section id="blog" className="py-32 px-4 sm:px-8 md:px-12 2xl:px-20 bg-background text-foreground border-t border-foreground/5">
      <div className="w-full max-w-none mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center space-x-2 bg-foreground/5 border border-foreground/10 rounded-full px-4 py-1.5 mb-8 inline-flex"
          >
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
               <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 0L6.12257 3.87743L10 5L6.12257 6.12257L5 10L3.87743 6.12257L0 5L3.87743 3.87743L5 0Z" fill="white"/>
               </svg>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-60">Diario</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-display tracking-tight mb-8">
            Descubre nuestro <em className="italic opacity-60">Laboratorio</em>
          </h2>
          <p className="max-w-xl mx-auto text-foreground/60 font-body text-sm sm:text-base">
            Explora nuestras investigaciones sobre IA, automatización y soluciones escalables.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-50 p-6 rounded-[2.5rem] border border-black/5 flex flex-col justify-between animate-pulse">
                <div>
                  <div className="aspect-[4/3] w-full bg-slate-200 rounded-[2rem] mb-6"></div>
                  <div className="space-y-3 px-2">
                    <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-full"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
                  </div>
                </div>
                <div className="mt-6 px-2">
                  <div className="h-4 bg-slate-200 rounded-md w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group cursor-pointer bg-slate-50 p-6 rounded-[2.5rem] border border-black/5 hover:border-black/10 hover:bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 flex flex-col justify-between"
                >
                  <Link to={`/blog/${post.id}`} className="block w-full flex-grow flex flex-col">
                    <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden mb-6">
                      <img 
                        src={post.image_url || 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop'} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" 
                      />
                    </div>
                    <div className="space-y-3 px-2 flex flex-col items-center md:items-start text-center md:text-left flex-grow">
                       <h3 className="text-lg md:text-xl font-body font-semibold tracking-tight text-foreground leading-[1.3] group-hover:text-primary transition-colors">
                         {post.title}
                       </h3>
                       <p className="text-sm text-foreground/60 leading-relaxed font-body line-clamp-2">
                         {getArticleExcerpt(post.content, 120)}
                       </p>
                    </div>
                  </Link>
                  <div className="mt-6 px-2 w-full flex justify-center md:justify-start">
                    <Link 
                      to={`/blog/${post.id}`}
                      className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors"
                    >
                      Leer artículo
                      <svg 
                        className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-20 text-foreground/40 font-body text-sm">
                No hay artículos publicados todavía.
              </div>
            )}

            <div className="flex justify-center mt-16">
              <Link 
                to="/blog" 
                className="bg-transparent border border-foreground/20 hover:border-foreground text-foreground px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
              >
                Ver todo el diario
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Blog;
