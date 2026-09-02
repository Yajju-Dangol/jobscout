import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, PhoneCallIcon } from "lucide-react";

export interface HeroSectionProps {
  badgeLabel?: string;
  badgeText?: string;
  badgeHref?: string;
  onBadgeClick?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  onPrimaryCtaClick?: () => void;
  onSecondaryCtaClick?: () => void;
  lightImageSrc?: string;
  darkImageSrc?: string;
  children?: React.ReactNode;
}

export function HeroSection({
  badgeLabel = "NOW",
  badgeText = "accepting new client projects",
  badgeHref = "#link",
  onBadgeClick,
  title = "Building Digital Experiences That Drive Growth",
  description = (
    <>
      We help brands scale faster through design, development <br /> and strategic execution.
    </>
  ),
  primaryCtaText = "Get started",
  secondaryCtaText = "Book a Call",
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  lightImageSrc = "https://storage.efferd.com/screen/dashboard-light.webp",
  darkImageSrc = "https://storage.efferd.com/screen/dashboard-dark.webp",
  children,
}: HeroSectionProps = {}) {
  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden pt-16">
      {/* Shades */}
      <div
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-hidden pointer-events-none"
      >
        <div
          className={cn(
            "absolute inset-0 isolate -z-10",
            "bg-[radial-gradient(20%_80%_at_20%_0%,rgba(255,255,255,0.1),transparent)]"
          )}
        />
      </div>
      <div className="relative z-10 flex max-w-2xl flex-col gap-5 px-4">
        <a
          className={cn(
            "group flex w-fit items-center gap-3 rounded-sm border border-border bg-card p-1 shadow-xs cursor-pointer",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out"
          )}
          href={badgeHref}
          onClick={(e) => {
            if (onBadgeClick) {
              e.preventDefault();
              onBadgeClick();
            }
          }}
        >
          <div className="rounded-xs border border-border bg-card px-1.5 py-0.5 shadow-sm">
            <p className="font-mono text-xs">{badgeLabel}</p>
          </div>

          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{badgeText}</span>
          <span className="block h-5 border-l border-border" />

          <div className="pr-1">
            <ArrowRightIcon className="size-3 -translate-x-0.5 duration-150 ease-out group-hover:translate-x-0.5" />
          </div>
        </a>

        <h1
          className={cn(
            "text-balance font-medium text-4xl text-foreground leading-tight md:text-5xl",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-100 duration-500 ease-out"
          )}
        >
          {title}
        </h1>

        <p
          className={cn(
            "text-muted-foreground text-sm tracking-wider sm:text-lg md:text-xl",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-200 duration-500 ease-out"
          )}
        >
          {description}
        </p>

        <div className="fade-in slide-in-from-bottom-10 flex w-fit animate-in items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out">
          <Button variant="outline" onClick={onSecondaryCtaClick}>
            <PhoneCallIcon className="size-4 mr-2" data-icon="inline-start" />{" "}
            {secondaryCtaText}
          </Button>
          <Button onClick={onPrimaryCtaClick}>
            {primaryCtaText}{" "}
            <ArrowRightIcon className="size-4 ml-2" data-icon="inline-end" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <div
          className={cn(
            "absolute -inset-x-20 inset-y-0 -translate-y-1/3 scale-120 rounded-full",
            "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent,transparent)]",
            "blur-[50px] pointer-events-none"
          )}
        />
        <div
          className={cn(
            "mask-b-from-60 relative mt-8 -mr-56 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20",
            "fade-in slide-in-from-bottom-5 animate-in fill-mode-backwards delay-100 duration-1000 ease-out"
          )}
        >
          <div className="relative inset-shadow-2xs inset-shadow-foreground/10 mx-auto max-w-5xl overflow-hidden rounded-lg border border-border bg-background p-2 shadow-xl ring-1 ring-card dark:inset-shadow-foreground/20 dark:inset-shadow-xs">
            {children ? (
              children
            ) : (
              <>
                <img
                  alt="app screen"
                  className="z-2 aspect-video rounded-lg border border-border dark:hidden w-full object-cover"
                  height="1080"
                  src={lightImageSrc}
                  width="1920"
                  referrerPolicy="no-referrer"
                />
                <img
                  alt="app screen"
                  className="hidden aspect-video rounded-lg bg-background border border-border dark:block w-full object-cover"
                  height="1080"
                  src={darkImageSrc}
                  width="1920"
                  referrerPolicy="no-referrer"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
