import { Globe, Headphones, Shield, Truck, type LucideIcon } from "lucide-react";

export type TeamMember = {
  name: string;
  role: string;
  image: string;
};

export type Pillar = {
  icon: string;
  title: string;
  description: string;
};

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const teamMembers: TeamMember[] = [
  {
    name: "Omer Saleh",
    role: "Operations Lead",
    image: "/images/team/omer-saleh.png",
  },
  {
    name: "Nour Hassan",
    role: "Customer Support Specialist",
    image: "/images/team/nour-hassan.png",
  },
  {
    name: "Faisal Rahman",
    role: "Tech & Development Lead",
    image: "/images/team/faisal-rahman.png",
  },
  {
    name: "Adnan Raza",
    role: "Marketing Strategist",
    image: "/images/team/adnan-raza.png",
  },
];

export const pillars: Pillar[] = [
  {
    icon: "/images/green-shield.png",
    title: "Trust & Transparency",
    description: "Secure shopping at every step.",
  },
  {
    icon: "/images/creative-heart.png",
    title: "Customer First",
    description: "Your satisfaction is our priority.",
  },
  {
    icon: "/images/star-badge.png",
    title: "Quality & Reliability",
    description: "Only products we stand behind.",
  },
  {
    icon: "/images/thunder.png",
    title: "Innovation & Growth",
    description: "Always improving your experience.",
  },
];

export const features: Feature[] = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Reliable shipping to your door.",
  },
  {
    icon: Globe,
    title: "Curated Products",
    description: "Curated products you'll love.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "100% protected checkout.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We are here anytime.",
  },
];
