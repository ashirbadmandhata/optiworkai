import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Bot, BarChart, FileText } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';

const landingHeroImage = PlaceHolderImages.find(img => img.id === 'landing-hero');
const featureAiChatImage = PlaceHolderImages.find(img => img.id === 'feature-ai-chat');
const featureInsightsImage = PlaceHolderImages.find(img => img.id === 'feature-insights');
const featureReportsImage = PlaceHolderImages.find(img => img.id === 'feature-reports');

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI-Powered HR Chat',
    description: 'Instant answers to your HR questions. Our AI assistant is available 24/7 to help you with your queries.',
    image: featureAiChatImage,
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Data-Driven Insights',
    description: 'Leverage AI to get deep insights into payroll trends, attendance patterns, and workforce analytics.',
    image: featureInsightsImage,
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Automated Reporting',
    description: 'Generate beautiful, comprehensive reports for payroll, performance, and compliance with a single click.',
    image: featureReportsImage,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-background via-background/80 to-muted/30 text-foreground">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-headline tracking-wide">OptiAi</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 md:py-40 lg:py-48 text-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="container relative flex flex-col items-center justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-primary/10 text-primary-600 inline-block rounded-full px-4 py-1.5 text-sm font-medium"
            >
              Built for the Future of Work
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-headline"
            >
              Intelligent Payroll,
              <br />
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-2 -skew-y-3 bg-gradient-to-r from-primary to-purple-600 rounded-md" aria-hidden="true"></span>
                <span className="relative text-primary-foreground">Effortless Management.</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl"
            >
              Welcome to <strong className="text-primary">OptiAi</strong>, the future of payroll systems. 
              We blend AI with intuitive design to make managing your workforce smarter and more efficient.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" asChild className="px-8 text-base shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                <Link href="/signup">
                  <Rocket className="mr-2" />
                  Start Free Trial
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 text-base hover:bg-muted/50">
                <Link href="#features">Learn More</Link>
              </Button>
            </motion.div>

            {/* Dashboard Demo Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="relative mt-16 w-full max-w-6xl mx-auto rounded-2xl border bg-background/90 backdrop-blur-lg shadow-2xl overflow-hidden"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src="/images/dashboard-demo.png" 
                  alt="OptiAi Dashboard Preview"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background/80 to-transparent"></div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-card/50 backdrop-blur-sm border-t border-border/20">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold font-headline mb-6">
              Why <span className="text-primary">OptiAi</span>?
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-16">
              Discover how our AI-driven payroll platform helps teams save time, reduce errors, and unlock new insights.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <Card className="group relative overflow-hidden rounded-xl border bg-background/80 text-left transition-all hover:border-primary/50 hover:shadow-2xl hover:scale-[1.02] duration-300">
                    <CardHeader>
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl font-bold font-headline">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Button variant="link" className="p-0 text-primary hover:text-primary/80">
                        Learn more &rarr;
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-muted/40 to-background border-t">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} <span className="font-semibold text-primary">OptiAi</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
