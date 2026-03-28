'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ScrollReveal } from '../ScrollReveal';
import { BLOG_POSTS, type BlogPost } from '@/src/lib/blog-posts';

type PortfolioStoryPageProps = {
  post: BlogPost;
};

export function PortfolioStoryPage({ post }: PortfolioStoryPageProps) {
  const relatedPosts = BLOG_POSTS.filter((item) => item.id !== post.id).slice(0, 3);
  const storyBlocks = post.fullStory.map((paragraph, index) => ({
    paragraph,
    image: post.gallery[index] ?? null
  }));

  return (
    <div className="min-h-screen w-full bg-[#fcf8f7] pb-24">
      <section className="relative min-h-[38svh] overflow-hidden pt-24 md:min-h-[44svh] md:pt-36">
        <img
          src={post.img}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,12,20,0.68)_0%,rgba(16,12,20,0.7)_24%,rgba(16,12,20,0.78)_58%,rgba(16,12,20,0.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%)]" />
        <div className="relative mx-auto flex min-h-[38svh] max-w-[1360px] items-end px-4 pb-8 sm:px-6 md:min-h-[44svh] md:px-10 md:pb-24">
          <div className="relative w-full">
            <div className="mx-auto max-w-5xl px-2 text-center">
              <div className="mx-auto mb-4 h-px w-14 bg-white/60 md:mb-5 md:w-16" />
              <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.35)] md:mb-5 md:tracking-[0.34em]">
                Story Overview
              </p>
              <h1 className="mx-auto max-w-[12ch] text-[2.35rem] font-serif leading-[0.96] text-white [text-shadow:0_8px_28px_rgba(0,0,0,0.38)] sm:max-w-[13ch] sm:text-5xl md:max-w-none md:text-6xl lg:text-[5.15rem]">
                {post.title}
              </h1>
              <p className="mx-auto mt-5 max-w-[22rem] text-[0.98rem] font-normal leading-[1.75] text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.34)] sm:max-w-[32rem] md:mt-7 md:max-w-[40rem] md:text-[1.15rem] md:leading-[1.9]">
                {post.desc}
              </p>
            </div>

            <div className="mt-6 flex justify-end md:mt-8">
              <Link
                href="/portfolio"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/24 bg-black/20 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/18 hover:shadow-[0_16px_38px_rgba(0,0,0,0.34)] md:text-[0.72rem] md:tracking-[0.2em]">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Blog</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 md:pt-10">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 gap-10 md:gap-12 xl:grid-cols-[minmax(0,760px)_300px] xl:items-start xl:justify-between">
            <div>
              <div className="space-y-10 md:space-y-14">
                {storyBlocks.map((block, index) => (
                  <React.Fragment key={`${post.id}-story-${index}`}>
                    <ScrollReveal direction="up">
                      <div className="space-y-4">
                        <p className="text-[1rem] leading-[1.85] text-brand-gray md:text-base md:leading-[1.95]">
                          {block.paragraph}
                        </p>
                      </div>
                    </ScrollReveal>

                    {block.image && (
                      <ScrollReveal direction="up" delay={index * 100}>
                        <figure className="overflow-hidden rounded-[1.25rem] md:rounded-[1.75rem]">
                          <img
                            src={block.image}
                            alt={`${post.title} detail ${index + 2}`}
                            className="max-h-[68svh] w-full object-cover md:max-h-none"
                          />
                        </figure>
                      </ScrollReveal>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <aside className="border-t border-brand-purple/10 pt-6 md:pt-8 xl:sticky xl:top-28 xl:border-t-0 xl:border-l xl:pl-8">
              <p className="mb-4 text-[0.78rem] uppercase tracking-[0.22em] text-brand-pink md:text-[0.72rem] md:tracking-[0.28em]">
                Event Snapshot
              </p>
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-[0.78rem] uppercase tracking-[0.14em] text-brand-gray md:text-[0.68rem] md:tracking-[0.18em]">
                    Category
                  </p>
                  <p className="text-[1rem] text-brand-dark md:text-base">{post.category}</p>
                </div>
                <div>
                  <p className="mb-2 text-[0.78rem] uppercase tracking-[0.14em] text-brand-gray md:text-[0.68rem] md:tracking-[0.18em]">
                    Location
                  </p>
                  <p className="text-[1rem] text-brand-dark md:text-base">{post.location}</p>
                </div>
                <div>
                  <p className="mb-2 text-[0.78rem] uppercase tracking-[0.14em] text-brand-gray md:text-[0.68rem] md:tracking-[0.18em]">
                    Date
                  </p>
                  <p className="text-[1rem] text-brand-dark md:text-base">{post.date}</p>
                </div>
              </div>

              <Link
                href="/consultation"
                className="mt-8 inline-flex min-h-12 items-center rounded-full bg-brand-purple px-6 py-3 text-sm uppercase tracking-[0.14em] text-white transition-colors hover:bg-brand-pink">
                Plan Your Event
              </Link>
            </aside>
          </div>

          <ScrollReveal direction="up">
            <div className="mt-16 border-t border-brand-purple/10 pt-8 md:mt-20">
              <p className="mb-5 text-[0.78rem] uppercase tracking-[0.16em] text-brand-pink md:text-[0.68rem] md:tracking-[0.22em]">
                Related Articles
              </p>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {relatedPosts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/portfolio/${item.id}`}
                    className="block text-left">
                    <div className="mb-3 aspect-[4/5] overflow-hidden rounded-[1rem] md:rounded-none">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="font-serif text-[1.02rem] leading-snug text-brand-dark md:text-sm">
                      {item.title}
                    </p>
                    <p className="mb-1 text-[0.72rem] uppercase tracking-[0.12em] text-brand-gray md:text-[0.62rem] md:tracking-[0.18em]">
                      {item.date}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
