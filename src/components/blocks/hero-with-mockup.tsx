import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Mockup } from '@/components/ui/mockup';
import { Glow } from '@/components/ui/glow';
import arkanaLogo from '@/assets/Arkana Logo fix.svg';

interface HeroWithMockupProps {
  title: string;
  description: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
    icon?: ReactNode;
  };
  mockupImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  className?: string;
}

export function HeroWithMockup({
  title,
  description,
  primaryCta = {
    text: 'Get Started',
    href: '/get-started',
  },
  secondaryCta = {
    text: 'GitHub',
    href: 'https://github.com/your-repo',
  },
  mockupImage,
  className,
}: HeroWithMockupProps) {
  return (
    <section
      className={cn(
        'relative bg-background text-foreground',
        'pt-6 pb-6 px-4 md:pt-0 md:pb-12 lg:pt-0 lg:pb-16',
        'overflow-hidden',
        className,
      )}
    >
<div className="relative mx-auto max-w-[1280px] flex flex-col gap-8 lg:gap-16">
  <div className="relative z-10 flex flex-col items-center gap-4 text-center lg:gap-6">
    <div className="arkana-hero-logo-wrap overflow-visible -mb-2 md:-mb-4 lg:-mb-6 md:-mt-6 lg:-mt-10">
      <img
        src={arkanaLogo}
        alt="Arkana"
        className="arkana-hero-logo h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] xl:h-[44rem] w-auto max-w-none select-none"
        draggable={false}
      />
    </div>

          <h1
            className={cn(
              'inline-block animate-appear opacity-0 [animation-delay:600ms]',
              'bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground',
              'bg-clip-text text-transparent',
              'text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl',
              'leading-[1.18] tracking-[-0.01em]',
              'pb-2 md:pb-3',
              'drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]',
            )}
          >
            {title}
          </h1>

          <p
            className={cn(
              'max-w-[550px] animate-appear opacity-0 [animation-delay:800ms]',
              'text-base sm:text-lg md:text-xl',
              'text-muted-foreground',
              'font-medium',
            )}
          >
            {description}
          </p>

          <div className="relative z-10 flex flex-wrap justify-center gap-4 animate-appear opacity-0 [animation-delay:1000ms]">
            <Button
              asChild
              size="lg"
              className={cn(
                'bg-gradient-to-b from-brand to-brand/90 dark:from-brand/90 dark:to-brand/80',
                'hover:from-brand/95 hover:to-brand/85 dark:hover:from-brand/80 dark:hover:to-brand/70',
                'text-white shadow-lg',
                'transition-all duration-300',
              )}
            >
              <a href={primaryCta.href}>{primaryCta.text}</a>
            </Button>

            <Button
              asChild
              size="lg"
              variant="ghost"
              className={cn(
                'text-foreground/80 dark:text-foreground/70',
                'transition-all duration-300',
              )}
            >
              <a href={secondaryCta.href}>
                {secondaryCta.icon}
                {secondaryCta.text}
              </a>
            </Button>
          </div>

          {mockupImage && (
            <div className="relative w-full pt-12 px-4 sm:px-6 lg:px-8">
              <Mockup
                className={cn(
                  'animate-appear opacity-0 [animation-delay:700ms]',
                  'shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]',
                  'border-brand/10 dark:border-brand/5',
                )}
              >
                <img
                  src={mockupImage.src}
                  alt={mockupImage.alt}
                  width={mockupImage.width}
                  height={mockupImage.height}
                  className="w-full h-auto"
                  loading="lazy"
                  decoding="async"
                />
              </Mockup>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Glow
          variant="above"
          className="animate-appear-zoom opacity-0 [animation-delay:1000ms]"
        />
      </div>
    </section>
  );
}
