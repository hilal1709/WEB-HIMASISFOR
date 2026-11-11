"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { cn } from "@/lib/utils";

/**
 * Carousel bertema (pagination & navigasi merah brand).
 * <SwiperCarousel items={[...]} render={(item) => <Card/>} />
 */
export function SwiperCarousel({ items, render, className, autoplay = true, slidesPerView = { base: 1, md: 2, lg: 3 } }) {
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination, A11y]}
      spaceBetween={20}
      pagination={{ clickable: true }}
      navigation
      loop={items.length > 3}
      autoplay={autoplay ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
      breakpoints={{
        0: { slidesPerView: slidesPerView.base },
        768: { slidesPerView: slidesPerView.md },
        1024: { slidesPerView: slidesPerView.lg },
      }}
      className={cn(
        "!pb-10 [--swiper-theme-color:var(--primary)] [--swiper-navigation-size:20px] [&_.swiper-button-next]:!text-primary [&_.swiper-button-prev]:!text-primary",
        className
      )}
    >
      {items.map((item, i) => (
        <SwiperSlide key={item.id ?? i} className="!h-auto">
          {render(item, i)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
