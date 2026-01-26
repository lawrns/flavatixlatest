import Head from 'next/head'

interface SocialMetaTagsProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  noindex?: boolean
  canonical?: string
}

const DEFAULT_META = {
  title: 'Flavatix - The one place for all your tasting needs',
  description: "The world's most comprehensive tasting app for anything with flavor or aroma. Discover, analyze, and share your tasting experiences with our user-friendly platform.",
  image: 'https://flavatix.com/icons/social-share-image.png',
  url: 'https://flavatix.com',
  type: 'website' as const,
  twitterCard: 'summary_large_image' as const,
}

export default function SocialMetaTags({
  title = DEFAULT_META.title,
  description = DEFAULT_META.description,
  image = DEFAULT_META.image,
  url = DEFAULT_META.url,
  type = DEFAULT_META.type,
  twitterCard = DEFAULT_META.twitterCard,
  noindex = false,
  canonical,
}: SocialMetaTagsProps) {
  return (
    <Head>
      {/* Page Title */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Flavatix" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@flavatix" />
      <meta name="twitter:creator" content="@flavatix" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  )
}
