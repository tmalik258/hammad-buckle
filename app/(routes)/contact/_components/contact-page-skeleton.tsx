import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import HeroSection from "@/components/hero-section";

export function ContactPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <HeroSection 
        title="Contact Us" 
        subtitle="Get in touch with our team. We&apos;re here to help with any questions or concerns."
        imageSrc="/images/contact-hero.jpg"
        imageAlt="Contact Us"
        showToggleButton={false}
        description="Contact us for any inquiries, feedback, or support."
        highlightText="Contact Us"
        buttonText="Get in Touch"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Skeleton */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Info Items */}
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form Skeleton */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-32 w-full" />
                </div>
                
                <Skeleton className="h-12 w-32" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section Skeleton */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="text-center">
                <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                <Skeleton className="h-5 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Support Options Skeleton */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-72 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="text-center">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-5 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto mb-4" />
                  <Skeleton className="h-10 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}