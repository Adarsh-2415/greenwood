import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const DOMAIN = 'https://www.greenwoodroorkee.org';
  
  const staticPaths = [
    '/',
    '/about',
    '/faculty',
    '/gallery',
    '/contact',
    '/administrator/fee-structure',
    '/administrator/category-wise-enrollment',
    '/administrator/class-wise-enrollment',
    '/administrator/senior-information',
    '/administrator/circulars',
    '/academics/curriculum',
    '/academics/examination-schedule',
    '/academics/subject-coordinators',
    '/academics/calendar',
    '/infrastructure/campus-classrooms',
    '/infrastructure/labs',
    '/infrastructure/library',
    '/infrastructure/sports-complex',
    '/achievements/awards-scholarships',
    '/achievements/painting-music-dance',
    '/transfer-certificate',
    '/mandatory-disclosures'
  ];

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    // Fallback just in case env vars aren't loaded (though Vercel provides them)
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials missing in environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: pages, error } = await supabase
      .from('pages')
      .select('route, updated_at')
      .eq('status', 'published');

    if (error) throw error;

    const dynamicPages = pages || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static paths
    staticPaths.forEach((path) => {
      xml += `  <url>\n`;
      xml += `    <loc>${DOMAIN}${path}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add dynamic paths from CMS
    dynamicPages.forEach((page) => {
      // Don't duplicate if a dynamic page overrides a static route
      if (staticPaths.includes(page.route)) return;
      
      const date = new Date(page.updated_at).toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${DOMAIN}${page.route}</loc>\n`;
      xml += `    <lastmod>${date}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache for 1 hour
    res.status(200).send(xml);

  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Even if it fails, try to return a static sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    staticPaths.forEach((path) => {
      xml += `  <url><loc>${DOMAIN}${path}</loc></url>\n`;
    });
    xml += `</urlset>`;
    
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  }
}
