"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Share2,
  Download,
  Heart,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { fetchPexelsImage } from "@/lib/fetchPexelsImage";
import { createCanvaDesign } from "@/lib/canva";
import html2canvas from "html2canvas";

interface CarouselSlide {
  title: string;
  content: string;
  imagePrompt: string;
  visualElements: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    layout: "text-focus" | "image-focus" | "balanced" | "quote" | "cta";
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
  const [generatedImages, setGeneratedImages] = useState<{
    [key: number]: string;
  }>({});
  const [editLinks, setEditLinks] = useState<{ [key: number]: string }>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const images: { [key: number]: string } = {};
      const links: { [key: number]: string } = {};
      const tokenMatch = document.cookie
        .split("; ")
        .find((row) => row.startsWith("canva_token="));
      const token = tokenMatch ? tokenMatch.split("=")[1] : null;
      for (let i = 0; i < slides.length; i++) {
        const prompt = slides[i].imagePrompt;
        let imageUrl: string | null = null;
        if (token) {
          try {
            const res = await createCanvaDesign(token, {
              title: slides[i].title,
              content: slides[i].content,
            });
            imageUrl = res.preview_url;
            links[i] = res.edit_url;
          } catch (e) {
            imageUrl = await fetchPexelsImage(prompt);
          }
        } else {
          imageUrl = await fetchPexelsImage(prompt);
        }
        if (imageUrl) {
          images[i] = imageUrl;
        }
      }
      setGeneratedImages(images);
      setEditLinks(links);
      setImagesLoaded(true);
    };
    fetchImages();
  }, [slides, branding]);

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

  const exportToPNG = async () => {
    if (!carouselRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(carouselRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        width: carouselRef.current.scrollWidth,
        height: carouselRef.current.scrollHeight,
      });
      
      const link = document.createElement('a');
      link.download = `carousel-${branding.topic.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-neutral-100 dark:bg-neutral-900 rounded-3xl">
        <p className="text-neutral-500">Aucun contenu à afficher</p>
      </div>
    );
  }

  if (!imagesLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-neutral-100 dark:bg-neutral-900 rounded-3xl">
        <p className="text-neutral-500 animate-pulse">
          Chargement des visuels...
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full max-w-6xl mx-auto", className)}>
      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={exportToPNG}
          disabled={isExporting}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Export...' : 'Exporter PNG'}</span>
        </button>
      </div>

      {/* Instagram-style Carousel Container */}
      <div 
        ref={carouselRef}
        className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
        style={{ height: '600px' }}
      >
        {/* Carousel Track */}
        <div className="relative h-full flex">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            const isPrev = index === currentSlide - 1 || (currentSlide === 0 && index === slides.length - 1);
            const isNext = index === currentSlide + 1 || (currentSlide === slides.length - 1 && index === 0);
            const isVisible = isActive || isPrev || isNext;

            if (!isVisible) return null;

            let translateX = 0;
            let zIndex = 1;
            let scale = 0.9;
            let opacity = 0.7;

            if (isActive) {
              translateX = 0;
              zIndex = 3;
              scale = 1;
              opacity = 1;
            } else if (isPrev) {
              translateX = -85; // Laisse voir 15% de l'image précédente
              zIndex = 2;
            } else if (isNext) {
              translateX = 85; // Laisse voir 15% de l'image suivante
              zIndex = 2;
            }

            return (
              <motion.div
                key={index}
                className="absolute inset-0 w-full h-full"
                initial={false}
                animate={{
                  x: `${translateX}%`,
                  scale,
                  opacity,
                  zIndex,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                style={{
                  backgroundColor: slide.visualElements.backgroundColor,
                }}
              >
                {renderInstagramSlide(
                  slide,
                  branding,
                  generatedImages[index],
                  index,
                  editLinks[index],
                )}
                
                {/* Overlay pour les slides non actives */}
                {!isActive && (
                  <div className="absolute inset-0 bg-black/20" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-4 flex items-center z-10">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 group"
            disabled={slides.length <= 1}
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-4 flex items-center z-10">
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 group"
            disabled={slides.length <= 1}
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>

          <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300">
            <Heart className="w-4 h-4 text-white" />
          </button>

          <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Instagram-style Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: branding.primaryColor }}
          />
          <span className="text-white text-sm font-medium">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Slide Thumbnails */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "group relative p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105",
              index === currentSlide ? "shadow-lg" : "hover:shadow-md",
            )}
            style={{
              borderColor:
                index === currentSlide ? branding.primaryColor : "transparent",
              backgroundColor:
                index === currentSlide
                  ? `${branding.primaryColor}10`
                  : "rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="text-xs opacity-60 mb-2">Slide {index + 1}</div>
            <div className="text-sm font-medium line-clamp-2 text-neutral-900 dark:text-neutral-100">
              {slide.title}
            </div>

            {/* Layout indicator */}
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              {slide.visualElements.layout === "image-focus" && (
                <ImageIcon className="w-3 h-3 opacity-60" />
              )}
              {slide.visualElements.layout === "text-focus" && (
                <div className="w-3 h-2 bg-current opacity-60 rounded-sm" />
              )}
              {slide.visualElements.layout === "cta" && (
                <div className="w-3 h-3 bg-current opacity-60 rounded-full" />
              )}
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

function renderInstagramSlide(
  slide: CarouselSlide,
  branding: BrandingData,
  generatedImage: string,
  slideIndex: number,
  editUrl?: string,
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
          width={50}
          height={50}
          className="rounded-xl shadow-lg"
        />
      </motion.div>
    ),
    title: (
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="text-2xl md:text-3xl font-bold leading-tight"
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
        className="text-base leading-relaxed opacity-90"
        style={{ color: slide.visualElements.textColor }}
      >
        {slide.content}
      </motion.p>
    ),
    image: generatedImage ? (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative w-full h-full"
      >
        <img
          src={generatedImage}
          alt={slide.title}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      </motion.div>
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <span className="text-gray-400">Image non disponible</span>
      </div>
    ),

    topicBadge: (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="px-3 py-1 rounded-full border backdrop-blur-sm"
        style={{
          borderColor: slide.visualElements.accentColor,
          backgroundColor: `${slide.visualElements.accentColor}20`,
        }}
      >
        <span
          className="font-medium text-xs"
          style={{ color: slide.visualElements.accentColor }}
        >
          #{branding.topic.replace(/\s+/g, "")}
        </span>
      </motion.div>
    ),
  };

  const editBadge = editUrl ? (
    <a
      href={editUrl}
      target="_blank"
      rel="noreferrer"
      className="absolute bottom-4 right-4 text-xs px-2 py-1 bg-white/80 rounded-md"
    >
      Modifier sur Canva
    </a>
  ) : null;

  // Layout adapté pour Instagram
  switch (layout) {
    case "image-focus":
      return (
        <div className="relative w-full h-full">
          {commonElements.image}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {commonElements.logo}
            <div className="space-y-3">
              {commonElements.title}
              {commonElements.content}
              {commonElements.topicBadge}
            </div>
          </div>
          {editBadge}
        </div>
      );

    case "text-focus":
      return (
        <div className="relative flex flex-col justify-center items-center p-8 text-center h-full">
          {commonElements.logo}
          <div className="space-y-4 max-w-lg">
            {commonElements.title}
            {commonElements.content}
            {commonElements.topicBadge}
          </div>
          {editBadge}
        </div>
      );

    case "balanced":
      return (
        <div className="relative grid grid-cols-2 h-full">
          <div className="relative">{commonElements.image}</div>
          <div className="flex flex-col justify-center p-6 space-y-4">
            {commonElements.logo}
            {commonElements.title}
            {commonElements.content}
            {commonElements.topicBadge}
          </div>
          {editBadge}
        </div>
      );

    case "quote":
      return (
        <div className="relative flex flex-col justify-center items-center p-8 text-center h-full">
          {generatedImage && (
            <div className="absolute inset-0">
              <img
                src={generatedImage}
                alt={slide.title}
                className="w-full h-full object-cover opacity-30"
                crossOrigin="anonymous"
              />
            </div>
          )}
          <div className="relative z-10">
            {commonElements.logo}
            <div className="space-y-4 max-w-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl opacity-40"
                style={{ color: slide.visualElements.accentColor }}
              >
                "
              </motion.div>
              {commonElements.title}
              {commonElements.content}
              {commonElements.topicBadge}
            </div>
          </div>
          {editBadge}
        </div>
      );

    case "cta":
      return (
        <div className="relative flex flex-col justify-center items-center p-8 text-center h-full space-y-6">
          {commonElements.logo}
          <div className="space-y-4 max-w-lg">
            {commonElements.title}
            {commonElements.content}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="px-6 py-3 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: slide.visualElements.accentColor }}
            >
              Découvrir maintenant
            </motion.button>
            {commonElements.topicBadge}
          </div>
          {editBadge}
        </div>
      );

    default:
      return (
        <div className="relative flex flex-col justify-center items-center p-8 text-center h-full">
          {commonElements.logo}
          <div className="space-y-4 max-w-lg">
            {commonElements.title}
            {commonElements.content}
            {commonElements.topicBadge}
          </div>
          {editBadge}
        </div>
      );
  }
}