import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Lock, 
  Star,
  Crown,
  CheckCircle,
  Clock,
  Users
} from "lucide-react";

export default function GuestPremium() {
  const premiumVideos = [
    {
      id: 1,
      title: "Advanced Learning Analytics",
      description: "Deep dive into learning analytics and how to use data to improve student outcomes.",
      duration: "25:30",
      price: "$9.99",
      rating: 4.8,
      views: 1250,
      locked: true,
      thumbnail: "📊"
    },
    {
      id: 2,
      title: "AI-Powered Assessment Tools",
      description: "Learn about our AI-driven assessment features and automated grading systems.",
      duration: "18:45",
      price: "$7.99",
      rating: 4.9,
      views: 890,
      locked: true,
      thumbnail: "🤖"
    },
    {
      id: 3,
      title: "Gamification in Education",
      description: "Discover how to implement gamification elements to boost student engagement.",
      duration: "32:15",
      price: "$12.99",
      rating: 4.7,
      views: 2100,
      locked: true,
      thumbnail: "🎮"
    },
    {
      id: 4,
      title: "Mobile Learning Optimization",
      description: "Best practices for optimizing learning content for mobile devices and tablets.",
      duration: "22:10",
      price: "$8.99",
      rating: 4.6,
      views: 1560,
      locked: true,
      thumbnail: "📱"
    },
    {
      id: 5,
      title: "Integration with Third-Party Tools",
      description: "Learn how to integrate ThinkPro LMS with popular educational tools and platforms.",
      duration: "28:20",
      price: "$11.99",
      rating: 4.8,
      views: 980,
      locked: true,
      thumbnail: "🔗"
    },
    {
      id: 6,
      title: "Advanced Reporting & Insights",
      description: "Master the art of creating comprehensive reports and gaining actionable insights.",
      duration: "35:45",
      price: "$14.99",
      rating: 4.9,
      views: 750,
      locked: true,
      thumbnail: "📈"
    }
  ];

  const subscriptionPlans = [
    {
      id: 1,
      name: "Basic Premium",
      price: "$19.99",
      period: "month",
      description: "Access to basic premium content",
      features: [
        "5 premium videos per month",
        "Basic analytics access",
        "Email support",
        "Mobile app access"
      ],
      popular: false
    },
    {
      id: 2,
      name: "Pro Premium",
      price: "$39.99",
      period: "month",
      description: "Full access to all premium content",
      features: [
        "Unlimited premium videos",
        "Advanced analytics dashboard",
        "Priority support",
        "Mobile app access",
        "Early access to new features",
        "Custom learning paths"
      ],
      popular: true
    },
    {
      id: 3,
      name: "Enterprise Premium",
      price: "$99.99",
      period: "month",
      description: "For organizations and institutions",
      features: [
        "Everything in Pro Premium",
        "Team collaboration tools",
        "Custom branding options",
        "Dedicated account manager",
        "API access",
        "White-label solutions"
      ],
      popular: false
    }
  ];

  const handleSubscribe = (planId: number) => {
    // TODO: Implement subscription functionality
    alert(`Subscription functionality for plan ${planId} will be implemented soon!`);
  };

  const handlePurchaseVideo = (videoId: number) => {
    // TODO: Implement individual video purchase functionality
    alert(`Video purchase functionality for video ${videoId} will be implemented soon!`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Content</h1>
        <p className="text-gray-600">
          Unlock exclusive premium videos and advanced features with our subscription plans.
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`shadow-md hover:shadow-lg transition-shadow ${
                plan.popular ? 'ring-2 ring-green-500 bg-gradient-to-b from-green-50 to-white' : ''
              }`}
            >
              <CardHeader className="text-center">
                {plan.popular && (
                  <Badge className="w-fit mx-auto mb-2 bg-green-600 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  } text-white`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Premium Videos */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Premium Video Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premiumVideos.map((video) => (
            <Card key={video.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="relative">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-4xl mb-3">
                    {video.thumbnail}
                  </div>
                  {video.locked && (
                    <div className="absolute top-2 right-2">
                      <div className="p-2 bg-black/50 rounded-full">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {video.title}
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  {video.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Video Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{video.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{video.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{video.rating}</span>
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      {video.price}
                    </div>
                    <Button
                      onClick={() => handlePurchaseVideo(video.id)}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Purchase
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Free Trial CTA */}
      <Card className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Your Free Trial Today!
            </h3>
            <p className="text-gray-600 mb-4">
              Get 7 days of free access to all premium content. No credit card required.
            </p>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              onClick={() => alert("Free trial functionality will be implemented soon!")}
            >
              <Crown className="h-4 w-4 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
