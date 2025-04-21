"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./components/LandingPage/Header";
import { Hero } from "./components/LandingPage/Hero";
import {Features} from "./components/LandingPage/Features";
import { HowItWorks } from "./components/LandingPage/HowItWorks";
import { Testimonials } from "./components/LandingPage/Testimonials";
import { Pricing } from "./components/LandingPage/Pricing";
import { FAQ } from "./components/LandingPage/FAQ";
import { Footer } from "./components/LandingPage/Footer";

export default function Home() {
  const id = Math.floor(Math.random()*1000)
  const router = useRouter()


  return (
    <div className="w-full min-h-screen bg-white">
    <Header />
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      <FAQ />
    </main>
    <Footer />
  </div>
  );
}
