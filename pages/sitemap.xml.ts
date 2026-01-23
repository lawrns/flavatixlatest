import { GetServerSideProps } from 'next';

// This is a dynamic sitemap generator for Next.js
// It generates sitemap entries for static and dynamic routes
export default function Sitemap() {
  // This component is never rendered - it only generates the XML
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://flavatix.com';
  const currentDate = new Date().toISOString().split('T')[0];

  // Static routes with their metadata
  const staticRoutes = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/flavor-wheels', priority: 0.9, changefreq: 'weekly' },
    { path: '/taste', priority: 0.9, changefreq: 'weekly' },
    { path: '/competition', priority: 0.8, changefreq: 'daily' },
    { path: '/create-tasting', priority: 0.7, changefreq: 'monthly' },
    { path: '/quick-tasting', priority: 0.7, changefreq: 'monthly' },
    { path: '/join-tasting', priority: 0.7, changefreq: 'monthly' },
    { path: '/social', priority: 0.8, changefreq: 'daily' },
    { path: '/review', priority: 0.7, changefreq: 'weekly' },
    { path: '/profile', priority: 0.6, changefreq: 'weekly' },
    { path: '/dashboard', priority: 0.6, changefreq: 'weekly' },
    { path: '/settings', priority: 0.5, changefreq: 'monthly' },
    { path: '/privacy', priority: 0.3, changefreq: 'monthly' },
    { path: '/terms', priority: 0.3, changefreq: 'monthly' },
    { path: '/sample', priority: 0.7, changefreq: 'weekly' },
    { path: '/my-tastings', priority: 0.7, changefreq: 'weekly' },
    { path: '/auth', priority: 0.4, changefreq: 'monthly' },
  ];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  // Set the correct content type and headers
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};
