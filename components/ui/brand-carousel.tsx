"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Share2, Download, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselSlide {
  title: string;
  content: string;
}

interface BrandingData {
  topic: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  tone: string;
}

interface BrandCarouselProps {
  slides: CarouselSlide[];
  branding: BrandingData;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const BrandCarousel = ({
  slides,
  branding,
  className,
  autoPlay = false,
  autoPlayInterval = 4000,
}: BrandCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      const interval = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, slides.length, autoPlayInterval]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-neutral-100 dark:bg-neutral-900 rounded-3xl">
        <p className="text-neutral-500">Aucun contenu à afficher</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {/* Main Carousel Container */}
      <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
        {/* Background with brand colors */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
          }}
        />
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, ${branding.primaryColor} 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${branding.secondaryColor} 2px, transparent 2px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Slide Content */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.4 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                nextSlide();
              } else if (swipe > swipeConfidenceThreshold) {
                prevSlide();
              }
            }}
            className="absolute inset-0 flex flex-col justify-center items-center p-12 text-center cursor-grab active:cursor-grabbing"
          >
            {/* Logo */}
            {branding.logo && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-8"
              >
                <img
                  src={branding.logo}
                  alt="Logo"
                  className="h-16 w-16 rounded-2xl shadow-lg"
                />
              </motion.div>
            )}

            {/* Slide Number */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-2 mb-6"
            >
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: branding.primaryColor }}
              >
                {currentSlide + 1} / {slides.length}
              </span>
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: branding.secondaryColor, animationDelay: '0.5s' }}
              />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 leading-tight"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {slides[currentSlide].title}
            </motion.h2>

            {/* Content */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-3xl"
            >
              {slides[currentSlide].content}
            </motion.p>

            {/* Topic Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 px-6 py-3 rounded-full border-2 backdrop-blur-sm"
              style={{
                borderColor: branding.primaryColor,
                backgroundColor: `${branding.primaryColor}10`,
              }}
            >
              <span
                className="font-medium"
                style={{ color: branding.primaryColor }}
              >
                #{branding.topic.replace(/\s+/g, '')}
              </span>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-4 flex items-center">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 group"
            disabled={slides.length <= 1}
          >
            <ChevronLeft className="w-6 h-6 text-neutral-800 dark:text-neutral-200 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-4 flex items-center">
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 group"
            disabled={slides.length <= 1}
          >
            <ChevronRight className="w-6 h-6 text-neutral-800 dark:text-neutral-200 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
            ) : (
              <Play className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
            )}
          </button>
          
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300">
            <Heart className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
          </button>
          
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300">
            <Share2 className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center mt-8 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === currentSlide
                ? "scale-125 shadow-lg"
                : "scale-100 opacity-50 hover:opacity-75"
            )}
            style={{
              backgroundColor: index === currentSlide ? branding.primaryColor : branding.secondaryColor,
            }}
          />
        ))}
      </div>

      {/* Slide Thumbnails */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "group relative p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105",
              index === currentSlide
                ? "shadow-lg"
                : "hover:shadow-md"
            )}
            style={{
              borderColor: index === currentSlide ? branding.primaryColor : 'transparent',
              backgroundColor: index === currentSlide 
                ? `${branding.primaryColor}10` 
                : 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="text-xs opacity-60 mb-2">Slide {index + 1}</div>
            <div className="text-sm font-medium line-clamp-2 text-neutral-900 dark:text-neutral-100">
              {slide.title}
            </div>
            
            {/* Active indicator */}
            {index === currentSlide && (
              <div
                className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: branding.primaryColor }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};