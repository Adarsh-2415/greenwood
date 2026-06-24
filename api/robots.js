export default function handler(req, res) {
  const DOMAIN = 'https://www.greenwoodroorkee.org';
  
  let robotsTxt = `User-agent: *\n`;
  robotsTxt += `Allow: /\n`;
  robotsTxt += `Disallow: /admin/\n\n`; // Protect admin routes
  robotsTxt += `Sitemap: ${DOMAIN}/sitemap.xml\n`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache for 24 hours
  res.status(200).send(robotsTxt);
}
