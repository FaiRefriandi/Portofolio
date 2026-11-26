import { createContext, useCallback, useContext, useEffect, useState } from "react";
import useEmblaCarousel, { CarouselDots } from "@animate-ui/react/primitives/carousel";

// Carousel animate-ui asli (paket @animate-ui/react). Efek skala dan
// penataan slide ditangani hook useEmblaCarousel mereka (opts scale/visible).
// Style card tidak disentuh di sini.
function cn(...args) {
  return args.filter(Boolean).join(" ");
}

const CarouselContext = createContext(null);

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

function Carousel({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onSelect = useCallback((api) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const scrollPrev = useCallback(() => {
    if (api) api.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    if (api) api.scrollNext();
  }, [api]);

  const scrollTo = useCallback(
    (index) => {
      if (api) api.scrollTo(index);
    },
    [api]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  useEffect(() => {
    if (api && setApi) setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) return undefined;
    setScrollSnaps(api.scrollSnapList());
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts && opts.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("pcarousel", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, children, ...props }) {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className="pcarousel__viewport" data-slot="carousel-content">
      <div className={cn("pcarousel__track", className)} {...props}>
        {children}
      </div>
    </div>
  );
}

function CarouselItem({ className, children, ...props }) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("pcarousel__slide", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CarouselPrevious({ className, ...props }) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Previous slide"
      data-slot="carousel-previous"
      className={cn("pcarousel__arrow", className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <span aria-hidden="true">{"\u2190"}</span>
    </button>
  );
}

function CarouselNext({ className, ...props }) {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Next slide"
      data-slot="carousel-next"
      className={cn("pcarousel__arrow", className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <span aria-hidden="true">{"\u2192"}</span>
    </button>
  );
}

function CarouselCounter({ className, ...props }) {
  const { selectedIndex, scrollSnaps } = useCarousel();
  return (
    <span className={cn("pcarousel__counter", className)} {...props}>
      {selectedIndex + 1} / {scrollSnaps.length}
    </span>
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselCounter,
  useCarousel,
};
