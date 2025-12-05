import fs from 'fs';
import path from 'path';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '@components/Layout';

type MafaldaPageProps = {
  images: string[]; // public-relative paths e.g. "/maf_failai/abc.jpg"
  title: string;
  sections: Array<{ heading?: string; paragraphs: string[]; backgroundColor?: string }>;
};

function ensureDirectoryExists(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

function copyDirectoryRecursiveSync(sourceDir: string, targetDir: string) {
  ensureDirectoryExists(targetDir);
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryRecursiveSync(srcPath, destPath);
    } else if (entry.isFile()) {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

export const getStaticProps: GetStaticProps<MafaldaPageProps> = async () => {
  const projectRoot = process.cwd();
  const sourceDir = path.join(projectRoot, 'maf_failai');
  const publicDir = path.join(projectRoot, 'public');
  const targetDir = path.join(publicDir, 'maf_failai');
  const htmlPath = path.join(projectRoot, 'maf.html');

  const copiedImagePublicPaths: string[] = [];
  const sourceFilenamesSet = new Set<string>();

  if (fs.existsSync(sourceDir)) {
    ensureDirectoryExists(publicDir);
    ensureDirectoryExists(targetDir);

    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    // If Canva export contains nested images directory for fonts, copy it
    const imagesDir = entries.find(e => e.isDirectory() && e.name === 'images');
    if (imagesDir) {
      try {
        copyDirectoryRecursiveSync(path.join(sourceDir, 'images'), path.join(targetDir, 'images'));
      } catch {}
    }
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const lower = entry.name.toLowerCase();
      const isImage = (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp'));
      const isStaticAsset = (lower.endsWith('.css') || lower.endsWith('.js'));
      if (!isImage && !isStaticAsset) {
        continue;
      }
      if (isImage) sourceFilenamesSet.add(entry.name);
      const srcPath = path.join(sourceDir, entry.name);
      const destPath = path.join(targetDir, entry.name);
      try {
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
        if (isImage) copiedImagePublicPaths.push(`/maf_failai/${entry.name}`);
      } catch (err) {
        // Skip files that cannot be copied; continue
      }
    }
  }

  // Parse maf.html for title and basic text content + image order

  // Parse maf.html for title and basic text content
  let title = 'Mafalda Garcia';
  const sections: Array<{ heading?: string; paragraphs: string[]; backgroundColor?: string }> = [];
  const orderedFromHtml: string[] = [];
  if (fs.existsSync(htmlPath)) {
    try {
      const raw = fs.readFileSync(htmlPath, 'utf8');
      const titleMatch = raw.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
      // Extract image order as they appear in HTML
      const imgRegex = /src=["'](?:\.?\/?)(maf_failai\/([^"'>]+?\.(?:jpg|jpeg|png|webp)))["']/gi;
      let im: RegExpExecArray | null;
      while ((im = imgRegex.exec(raw)) !== null) {
        const filename = im[2];
        if (filename && sourceFilenamesSet.has(filename) && !orderedFromHtml.includes(`/maf_failai/${filename}`)) {
          orderedFromHtml.push(`/maf_failai/${filename}`);
        }
      }
      // Extract blocks with visible text; Canva exports use many <p> spans
      const sectionRegex = /<section[\s\S]*?<\/section>/gi;
      const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
      const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/i;
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      const stripTags = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const foundSections = raw.match(sectionRegex) || [];
      for (const sec of foundSections) {
        const headingMatch = h1Regex.exec(sec) || h2Regex.exec(sec);
        const heading = headingMatch ? stripTags(headingMatch[1]) : undefined;
        // Extract background-color inline style if present on the section
        let backgroundColor: string | undefined;
        const styleMatch = sec.match(/<section[^>]*style\s*=\s*"([^"]*)"/i);
        if (styleMatch && styleMatch[1]) {
          const styleContent = styleMatch[1];
          const bgMatch = styleContent.match(/background-color\s*:\s*([^;]+);?/i);
          if (bgMatch && bgMatch[1]) backgroundColor = bgMatch[1].trim();
        }
        const paragraphs: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = pRegex.exec(sec)) !== null) {
          const text = stripTags(m[1]);
          if (text) paragraphs.push(text);
        }
        if (heading || paragraphs.length) {
          const base = { paragraphs } as { heading?: string; paragraphs: string[]; backgroundColor?: string };
          if (heading) base.heading = heading;
          if (backgroundColor) base.backgroundColor = backgroundColor;
          sections.push(base);
        }
      }
      // Fallback: if no sections found, grab generic paragraphs
      if (sections.length === 0) {
        const paragraphs: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = pRegex.exec(raw)) !== null) {
          const text = stripTags(m[1]);
          if (text) paragraphs.push(text);
        }
        if (paragraphs.length) sections.push({ paragraphs });
      }
    } catch {}
  }

  // Build final image list: first those ordered in HTML, then remaining copied ones deterministic
  const remaining = copiedImagePublicPaths.filter(p => !orderedFromHtml.includes(p)).sort((a, b) => a.localeCompare(b));
  const finalImages = orderedFromHtml.concat(remaining);

  // Sanitize sections to avoid undefined props in Next.js serialization
  const sanitizedSections = sections.map(sec => {
    const out: { heading?: string; paragraphs: string[]; backgroundColor?: string } = { paragraphs: sec.paragraphs };
    if (sec.heading) out.heading = sec.heading;
    if (sec.backgroundColor) out.backgroundColor = sec.backgroundColor;
    return out;
  });

  // Also copy maf.html to public for an optional pixel-accurate reference view
  try {
    if (fs.existsSync(htmlPath)) {
      const publicHtmlPath = path.join(publicDir, 'maf.html');
      if (!fs.existsSync(publicHtmlPath)) {
        fs.copyFileSync(htmlPath, publicHtmlPath);
      }
    }
  } catch {}

  return {
    props: {
      images: finalImages,
      title,
      sections: sanitizedSections,
    },
  };
};

export default function MafaldaGarciaPage({ images, title, sections }: MafaldaPageProps) {
  const hasImages = images && images.length > 0;
  const hero = hasImages ? images[0] : undefined;

  return (
    <Layout translationNs={["common"]}>
      <Head>
        <title>{title || 'Mafalda Garcia'}</title>
        <meta name="description" content="Portfolio of Mafalda Garcia" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen w-full bg-white text-black">
        {/* Hero Section */}
        <section className="w-full">
          {hero ? (
            <div className="relative w-full h-[60vh] md:h-[75vh]">
              <Image src={hero} alt="Mafalda Garcia Hero" fill priority className="object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-end md:items-center justify-center p-6">
                <h1 className="text-white text-4xl md:text-6xl font-semibold drop-shadow-md text-center">
                  {title || 'Mafalda Garcia'}
                </h1>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100">
              <span className="text-gray-500">Add images to maf_failai to populate the page</span>
            </div>
          )}
        </section>

        {/* Text sections parsed from maf.html */}
        {sections && sections.length > 0 && (
          <div>
            {sections.map((sec, i) => (
              <section key={i} className="px-4 py-12" style={{ backgroundColor: sec.backgroundColor }}>
                <div className="max-w-5xl mx-auto space-y-4">
                  {sec.heading && (
                    <h2 className="text-3xl md:text-4xl font-semibold text-center">{sec.heading}</h2>
                  )}
                  {sec.paragraphs && sec.paragraphs.length > 0 && (
                    <div className="space-y-4 text-gray-800 leading-8 text-[1.125rem]">
                      {sec.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Gallery Section */}
        {hasImages && (
          <section className="max-w-6xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((src, idx) => (
                <div key={src} className="relative w-full overflow-hidden rounded-md shadow">
                  <div className="relative w-full pt-[75%]">
                    <Image src={src} alt={`Gallery image ${idx + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}


