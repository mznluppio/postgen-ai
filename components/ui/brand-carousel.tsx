"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Share2, Download, Heart, Palette, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CarouselSlide {
  title: string;
  content: string;
  imagePrompt: string;
  visualElements: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    layout: 'text-focus' | 'image-focus' | 'balanced' | 'quote' | 'cta';
  };
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
  const [generatedImages, setGeneratedImages] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      const interval = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, slides.length, autoPlayInterval]);

  // Générer des images placeholder basées sur les prompts
  useEffect(() => {
    const generatePlaceholderImages = () => {
      const images: { [key: number]: string } = {};
      slides.forEach((slide, index) => {
        // Utiliser une API de placeholder ou générer des SVG dynamiques
        images[index] = generateSVGPlaceholder(slide, branding, index);
      });
      setGeneratedImages(images);
    };

    generatePlaceholderImages();
  }, [slides, branding]);

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

  const currentSlideData = slides[currentSlide];

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {/* Main Carousel Container */}
      <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
        {/* Animated background pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${branding.primaryColor}20 0%, ${branding.secondaryColor}20 100%)`,
          }}
        />

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
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              backgroundColor: currentSlideData.visualElements.backgroundColor,
            }}
          >
            {renderSlideLayout(currentSlideData, branding, generatedImages[currentSlide], currentSlide)}
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

        {/* Slide Counter */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
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
            
            {/* Layout indicator */}
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              {slide.visualElements.layout === 'image-focus' && <ImageIcon className="w-3 h-3 opacity-60" />}
              {slide.visualElements.layout === 'text-focus' && <div className="w-3 h-2 bg-current opacity-60 rounded-sm" />}
              {slide.visualElements.layout === 'cta' && <div className="w-3 h-3 bg-current opacity-60 rounded-full" />}
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

function renderSlideLayout(
  slide: CarouselSlide,
  branding: BrandingData,
  generatedImage: string,
  slideIndex: number
) {
  const { layout } = slide.visualElements;

  const commonElements = {
    logo: branding.logo && (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="absolute top-6 left-6 z-10"
      >
        <Image
          src={branding.logo}
          alt="Logo"
          width={60}
          height={60}
          className="rounded-xl shadow-lg"
        />
      </motion.div>
    ),
    title: (
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="text-3xl md:text-4xl font-bold leading-tight"
        style={{ color: slide.visualElements.textColor }}
      >
        {slide.title}
      </motion.h2>
    ),
    content: (
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="text-lg leading-relaxed opacity-90"
        style={{ color: slide.visualElements.textColor }}
      >
        {slide.content}
      </motion.p>
    ),
    image: generatedImage && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative"
      >
        <div 
          dangerouslySetInnerHTML={{ __html: generatedImage }}
          className="w-full h-full"
        />
      </motion.div>
    ),
    topicBadge: (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="px-4 py-2 rounded-full border-2 backdrop-blur-sm"
        style={{
          borderColor: slide.visualElements.accentColor,
          backgroundColor: `${slide.visualElements.accentColor}20`,
        }}
      >
        <span
          className="font-medium text-sm"
          style={{ color: slide.visualElements.accentColor }}
        >
          #{branding.topic.replace(/\s+/g, '')}
        </span>
      </motion.div>
    )
  };

  switch (layout) {
    case 'text-focus':
      return (
        <div className="flex flex-col justify-center items-center p-12 text-center h-full">
          {commonElements.logo}
          <div className="space-y-6 max-w-3xl">
            {commonElements.title}
            {commonElements.content}
            {commonElements.topicBadge}
          </div>
        </div>
      );

    case 'image-focus':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {commonElements.logo}
          <div className="flex items-center justify-center p-8">
            {commonElements.image}
          </div>
          <div className="flex flex-col justify-center p-8 space-y-4">
            {commonElements.title}
            {commonElements.content}
            {commonElements.topicBadge}
          </div>
        </div>
      );

    case 'balanced':
      return (
        <div className="flex flex-col justify-center items-center p-12 text-center h-full space-y-8">
          {commonElements.logo}
          <div className="max-w-md">
            {commonElements.image}
          </div>
          <div className="space-y-4 max-w-2xl">
            {commonElements.title}
            {commonElements.content}
            {commonElements.topicBadge}
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="flex flex-col justify-center items-center p-12 text-center h-full">
          {commonElements.logo}
          <div className="space-y-6 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl opacity-20"
              style={{ color: slide.visualElements.accentColor }}
            >
              "
            </motion.div>
            {commonElements.title}
            {commonElements.content}
            {commonElements.topicBadge}
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="flex flex-col justify-center items-center p-12 text-center h-full space-y-8">
          {commonElements.logo}
          <div className="space-y-6 max-w-3xl">
            {commonElements.title}
            {commonElements.content}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="px-8 py-4 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: slide.visualElements.accentColor }}
            >
              Découvrir maintenant
            </motion.button>
            {commonElements.topicBadge}
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col justify-center items-center p-12 text-center h-full">
          {commonElements.logo}
          <div className="space-y-6 max-w-3xl">
            {commonElements.title}
            {commonElements.content}
            {commonElements.topicBadge}
          </div>
        </div>
      );
  }
}

function generateSVGPlaceholder(
  slide: CarouselSlide,
  branding: BrandingData,
  index: number
): string {
  const { layout } = slide.visualElements;
  const width = layout === 'image-focus' ? 400 : 300;
  const height = layout === 'image-focus' ? 300 : 200;

  // Créer des patterns visuels basés sur le layout et le contenu
  const patterns = {
    'text-focus': generateTextPattern(slide, branding, width, height),
    'image-focus': generateImagePattern(slide, branding, width, height),
    'balanced': generateBalancedPattern(slide, branding, width, height),
    'quote': generateQuotePattern(slide, branding, width, height),
    'cta': generateCTAPattern(slide, branding, width, height),
  };

  return patterns[layout] || patterns.balanced;
}

function generateTextPattern(slide: CarouselSlide, branding: BrandingData, width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${branding.primaryColor};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${branding.secondaryColor};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#textGrad)"/>
      <circle cx="${width * 0.2}" cy="${height * 0.3}" r="20" fill="${branding.primaryColor}" opacity="0.4"/>
      <circle cx="${width * 0.8}" cy="${height * 0.7}" r="15" fill="${branding.secondaryColor}" opacity="0.4"/>
      <rect x="${width * 0.1}" y="${height * 0.4}" width="${width * 0.8}" height="4" fill="${branding.primaryColor}" opacity="0.6"/>
      <rect x="${width * 0.1}" y="${height * 0.5}" width="${width * 0.6}" height="4" fill="${branding.secondaryColor}" opacity="0.6"/>
      <rect x="${width * 0.1}" y="${height * 0.6}" width="${width * 0.7}" height="4" fill="${branding.primaryColor}" opacity="0.6"/>
    </svg>
  `;
}

function generateImagePattern(slide: CarouselSlide, branding: BrandingData, width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="imageGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${branding.primaryColor};stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:${branding.secondaryColor};stop-opacity:0.2" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#imageGrad)"/>
      <polygon points="${width * 0.3},${height * 0.2} ${width * 0.7},${height * 0.2} ${width * 0.5},${height * 0.6}" fill="${branding.primaryColor}" opacity="0.5"/>
      <circle cx="${width * 0.5}" cy="${height * 0.75}" r="30" fill="${branding.secondaryColor}" opacity="0.4"/>
      <rect x="${width * 0.2}" y="${height * 0.1}" width="8" height="${height * 0.8}" fill="${branding.primaryColor}" opacity="0.3"/>
      <rect x="${width * 0.8}" y="${height * 0.1}" width="8" height="${height * 0.8}" fill="${branding.secondaryColor}" opacity="0.3"/>
    </svg>
  `;
}

function generateBalancedPattern(slide: CarouselSlide, branding: BrandingData, width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="balancedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${branding.primaryColor};stop-opacity:0.3" />
          <stop offset="50%" style="stop-color:${branding.secondaryColor};stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:${branding.primaryColor};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#balancedGrad)"/>
      <circle cx="${width * 0.25}" cy="${height * 0.25}" r="25" fill="${branding.primaryColor}" opacity="0.4"/>
      <circle cx="${width * 0.75}" cy="${height * 0.75}" r="20" fill="${branding.secondaryColor}" opacity="0.4"/>
      <path d="M ${width * 0.1} ${height * 0.5} Q ${width * 0.5} ${height * 0.2} ${width * 0.9} ${height * 0.5}" stroke="${branding.primaryColor}" stroke-width="3" fill="none" opacity="0.5"/>
    </svg>
  `;
}

function generateQuotePattern(slide: CarouselSlide, branding: BrandingData, width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="quoteGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:${branding.secondaryColor};stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:${branding.primaryColor};stop-opacity:0.2" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#quoteGrad)"/>
      <text x="${width * 0.2}" y="${height * 0.4}" font-family="serif" font-size="60" fill="${branding.primaryColor}" opacity="0.3">"</text>
      <text x="${width * 0.7}" y="${height * 0.7}" font-family="serif" font-size="60" fill="${branding.secondaryColor}" opacity="0.3">"</text>
      <circle cx="${width * 0.8}" cy="${height * 0.2}" r="12" fill="${branding.primaryColor}" opacity="0.4"/>
      <circle cx="${width * 0.2}" cy="${height * 0.8}" r="8" fill="${branding.secondaryColor}" opacity="0.4"/>
    </svg>
  `;
}

function generateCTAPattern(slide: CarouselSlide, branding: BrandingData, width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${branding.primaryColor};stop-opacity:0.5" />
          <stop offset="100%" style="stop-color:${branding.secondaryColor};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#ctaGrad)"/>
      <rect x="${width * 0.3}" y="${height * 0.4}" width="${width * 0.4}" height="${height * 0.2}" rx="20" fill="${branding.primaryColor}" opacity="0.6"/>
      <polygon points="${width * 0.5},${height * 0.2} ${width * 0.6},${height * 0.35} ${width * 0.4},${height * 0.35}" fill="${branding.secondaryColor}" opacity="0.5"/>
      <circle cx="${width * 0.15}" cy="${height * 0.5}" r="15" fill="${branding.primaryColor}" opacity="0.4"/>
      <circle cx="${width * 0.85}" cy="${height * 0.5}" r="15" fill="${branding.secondaryColor}" opacity="0.4"/>
    </svg>
  `;
}