"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/ui/error-component";
import { ContactPageSkeleton } from "./_components/contact-page-skeleton";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  Truck,
  CreditCard,
  User,
  Globe
} from "lucide-react";

// Contact information
const contactInfo = {
  address: {
    street: "123 Commerce Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States"
  },
  phone: "+1 (555) 123-4567",
  email: "support@hammadbuckle.com",
  hours: {
    weekdays: "Monday - Friday: 9:00 AM - 8:00 PM EST",
    weekends: "Saturday - Sunday: 10:00 AM - 6:00 PM EST"
  }
};

// FAQ data
const faqData = [
  {
    category: "Orders",
    icon: ShoppingBag,
    questions: [
      {
        question: "How can I track my order?",
        answer: "You can track your order by visiting our Track Order page and entering your order number or tracking ID."
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "Orders can be modified or cancelled within 1 hour of placement. Please contact us immediately if you need to make changes."
      }
    ]
  },
  {
    category: "Shipping",
    icon: Truck,
    questions: [
      {
        question: "What are your shipping options?",
        answer: "We offer standard shipping (5-7 business days), express shipping (2-3 business days), and overnight shipping."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to over 50 countries worldwide. International shipping times vary by destination."
      }
    ]
  },
  {
    category: "Payments",
    icon: CreditCard,
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and bank transfers."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard SSL encryption and are PCI DSS compliant to protect your payment information."
      }
    ]
  },
  {
    category: "Account",
    icon: User,
    questions: [
      {
        question: "How do I create an account?",
        answer: "Click on the 'Sign Up' button in the top right corner and fill out the registration form with your details."
      },
      {
        question: "I forgot my password. What should I do?",
        answer: "Click on 'Forgot Password' on the login page and we'll send you a reset link to your email address."
      }
    ]
  }
];

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "general",
    message: "",
    orderNumber: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user makes selection
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ""))) {
        errors.phone = "Please enter a valid phone number";
      }
    }

    // Subject validation
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      errors.subject = "Subject must be at least 5 characters";
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    }

    // Category validation
    if (!formData.category) {
      errors.category = "Please select a category";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!validateForm()) {
        toast.error("Please fix the errors in the form");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      
      // Prepare contact data
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        category: formData.category,
        message: formData.message.trim(),
        orderNumber: formData.orderNumber.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random API failure for testing
          if (Math.random() > 0.8) {
            reject(new Error("Failed to send message. Please try again."));
          } else {
            resolve(contactData);
          }
        }, 2000);
      });
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll get back to you soon.");
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          category: "general",
          message: "",
          orderNumber: ""
        });
        setFormErrors({});
      }, 3000);
      
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const toggleFaq = (questionId: string) => {
    setExpandedFaq(expandedFaq === questionId ? null : questionId);
  };

  // Loading state
  if (isLoading) {
    return <ContactPageSkeleton />;
  }

  // Error state
  if (error && !isSubmitting) {
    return (
      <ErrorComponent 
        message={error}
        onRefresh={handleRetry}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-serif mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We&apos;re here to help! Get in touch with our customer support team for any questions or concerns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Visit Our Store</h4>
                  <p className="text-gray-600 text-sm">
                    {contactInfo.address.street}<br />
                    {contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.zip}<br />
                    {contactInfo.address.country}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Call Us</h4>
                  <p className="text-gray-600 text-sm">{contactInfo.phone}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Email Us</h4>
                  <p className="text-gray-600 text-sm">{contactInfo.email}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Business Hours</h4>
                  <p className="text-gray-600 text-sm">
                    {contactInfo.hours.weekdays}<br />
                    {contactInfo.hours.weekends}
                  </p>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-900">Response Time</span>
                </div>
                <p className="text-blue-800 text-sm">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600">
                    Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                        className={formErrors.name ? 'border-red-500 focus:ring-red-500' : ''}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email address"
                        className={formErrors.email ? 'border-red-500 focus:ring-red-500' : ''}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className={formErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                        <SelectTrigger className={`w-full ${
                          formErrors.category ? 'border-red-500 focus:ring-red-500' : 'focus:border-purple-400'
                        }`}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="order">Order Support</SelectItem>
                          <SelectItem value="shipping">Shipping Question</SelectItem>
                          <SelectItem value="returns">Returns & Exchanges</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.category && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                      )}
                    </div>
                  </div>

                  {/* Order Number (conditional) */}
                  {(formData.category === "order" || formData.category === "shipping" || formData.category === "returns") && (
                    <div>
                      <Label htmlFor="orderNumber">Order Number</Label>
                      <Input
                        id="orderNumber"
                        name="orderNumber"
                        value={formData.orderNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your order number (optional)"
                      />
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="Brief description of your inquiry"
                      className={formErrors.subject ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                    {formErrors.subject && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Please provide details about your inquiry..."
                      className={formErrors.message ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                    {formErrors.message && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-serif mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find quick answers to common questions. Can&apos;t find what you&apos;re looking for? Contact us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqData.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IconComponent className="mr-2 h-5 w-5" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.questions.map((faq, index) => {
                      const questionId = `${category.category}-${index}`;
                      const isExpanded = expandedFaq === questionId;
                      
                      return (
                        <div key={questionId} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                          <button
                            onClick={() => toggleFaq(questionId)}
                            className="flex items-center justify-between w-full text-left cursor-pointer"
                          >
                            <span className="font-medium text-sm">{faq.question}</span>
                            <HelpCircle className={`h-4 w-4 text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} />
                          </button>
                          {isExpanded && (
                            <div className="mt-2 text-sm text-gray-600">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Additional Support Options */}
      <div className="bg-gray-50 rounded-lg p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Need More Help?</h3>
          <p className="text-gray-600">Explore these additional support options</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Globe className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h4 className="font-semibold mb-2">Help Center</h4>
              <p className="text-sm text-gray-600 mb-4">
                Browse our comprehensive help articles and guides
              </p>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Visit Help Center
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h4 className="font-semibold mb-2">Live Chat</h4>
              <p className="text-sm text-gray-600 mb-4">
                Chat with our support team in real-time
              </p>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Start Live Chat
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Truck className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h4 className="font-semibold mb-2">Order Status</h4>
              <p className="text-sm text-gray-600 mb-4">
                Track your orders and delivery status
              </p>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Track Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}