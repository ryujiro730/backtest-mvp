// Server Component
export async function generateMetadata({ params }: { params: { id: string; locale: string } }) {
  const { id } = params;
  const ogPath = `/app/results/${id}/opengraph-image`; // 相対でOK（metadataBaseが補完）
  return {
    title: `Result #${id.slice(0,8)} – Delver`,
    openGraph: {
      type: 'article',
      images: [{ url: ogPath, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogPath],
    },
  };
}
