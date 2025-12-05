import Head from 'next/head';

export default function OriginalReference() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>Original (Canva Export)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <iframe
        src="/maf.html"
        className="w-full"
        style={{ minHeight: '100vh', border: 'none' }}
        title="Original Canva Export"
      />
    </div>
  );
}


