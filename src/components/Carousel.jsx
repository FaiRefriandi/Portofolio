import { createContext, useCallback, useContext, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

// Carousel gaya Animate UI (Embla). Slide tetangga mengecil ke 0.8 seperti
// demo animate-ui, slide aktif penuh. Style card tidak disentuh di sini.
const SCALE = 0.8;

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

  const applyScale = useCallback(() => {
    if (!api) return;
    const nodes = api.slideNodes();
    const count = nodes.length;
    if (!count) return;
    const pos = api.scrollProgress() * (count - 1);
    nodes.forEach((node, i) => {
      let d = Math.abs(pos - i);
      d = Math.min(d, count - d);
      const s = Math.pow(SCALE, Math.min(d, 2));
      node.style.setProperty("--slide-scale", s.toFixed(3));
    });
  }, [api]);

  const onSelect = useCallback(
    (api) => {
      if (!api) return;
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.selectedScrollSnap());
      applyScale();
    },
    [applyScale]
  );

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
    api.on("scroll", applyScale);
    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
      api.off("scroll", applyScale);
    };
  }, [api, onSelect, applyScale]);

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
        className={"pcarousel" + (className ? " " + className : "")}
        role="region"
        aria-roledescription="carousel"
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
      <div className={"pcarousel__track" + (className ? " " + className : "")} {...props}>
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
      className={"pcarousel__slide" + (className ? " " + className : "")}
      {...props}
    >
      <div className="pcarousel__slide-inner">{children}</div>
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
      className={"pcarousel__arrow" + (className ? " " + className : "")}
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
      className={"pcarousel__arrow" + (className ? " " + className : "")}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <span aria-hidden="true">{"\u2192"}</span>
    </button>
  );
}

function CarouselDots({ className, ...props }) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();
  return (
    <div className={"pcarousel__dots" + (className ? " " + className : "")} {...props}>
      {scrollSnaps.map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={"Go to slide " + (i + 1)}
          aria-current={i === selectedIndex}
          className={"pcarousel__dot" + (i === selectedIndex ? " is-active" : "")}
          onClick={() => scrollTo(i)}
        />
      ))}
    </div>
  );
}

function CarouselCounter({ className, ...props }) {
  const { selectedIndex, scrollSnaps } = useCarousel();
  return (
    <span className={"pcarousel__counter" + (className ? " " + className : "")} {...props}>
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
