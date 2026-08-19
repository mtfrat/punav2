import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getCalApi } from "@calcom/embed-react";
import Home from './pages/Home';
import HomeEn from './pages/HomeEn';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import ScrollToTop from './components/ui/ScrollToTop';

export default function App() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({});
      cal("ui", { 
        "styles": { "branding": { "brandColor": "#af4c24" } }, 
        "hideEventTypeDetails": false, 
        "layout": "month_view" 
      });
    })();
  }, []);
  return (
    <div className="bg-[#050505] min-h-screen text-[#f5f5f5] font-sans antialiased selection:bg-white/10 selection:text-white flex flex-col">
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomeEn />} />
          <Route path="/es" element={<Home />} />
          <Route path="/en" element={<HomeEn />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
        </Routes>
      </Router>
    </div>
  );
}
