import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getVideoRecommendation } from "@/lib/api";
import DailyChallenge from "@/components/gamification/DailyChallenge";
import {
  Calculator,
  TrendingUp,
  Lightbulb,
  Zap,
  BookOpen,
  Target,
  ArrowRight,
  CheckCircle,
  Github,
  Play,
  X,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Home({ user }) {
  usePageTitle("Maths Solver - Master Math with Confidence");

  const [selectedVideo, setSelectedVideo] = useState(null);

  // Recommended videos for homepage
  const recommendedVideos = [
    {
      title: "Introduction to Derivatives",
      description: "Learn the fundamentals of derivatives with this helpful video tutorial.",
      embedUrl: "https://www.youtube.com/embed/V2d4i7U_jp4"
    },
    {
      title: "Integration Fundamentals",
      description: "Learn the fundamentals of integration with this helpful video tutorial.",
      embedUrl: "https://www.youtube.com/embed/zOxaUlRkFG0"
    },
    {
      title: "Algebra Basics",
      description: "Master the basics of algebra with this comprehensive video guide.",
      embedUrl: "https://www.youtube.com/embed/NybHckSEQBI"
    },
  ];

  const handleWatchVideo = (video) => {
    setSelectedVideo(video);
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-16 text-center">
        <div className="mb-6 md:mb-8 flex flex-col items-center">
          <img
            src="/favicon.png"
            alt="Maths Solver Logo"
            className="w-16 h-16 md:w-20 md:h-20 mb-4"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-2 text-gray-900 dark:text-[#E5E7EB]">
            Welcome to Maths Solver{user ? `, ${user.displayName || 'User'}` : ''}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-[#9CA3AF] mb-2 px-2">
            Master math with confidence
          </p>
          {user && (
            <div className="inline-block mb-4 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
              <CheckCircle className="w-4 h-4 inline mr-2 text-green-400" />
              <span className="text-green-400">Logged in successfully!</span>
            </div>
          )}
          <p className="text-sm md:text-base px-2 text-[#9CA3AF]">
            Your personal math tutor for solving common math problems like calculus, algebra, and trigonometry
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-3 mb-6 md:mb-8 px-2">
          <Link to={createPageUrl("Solver")} className="w-full sm:w-auto">
            <Button size="lg" className="btn btn-primary w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/25">
              <Calculator className="w-4 h-4 mr-2" />
              Start Solving
            </Button>
          </Link>
          <Link to={createPageUrl("Quiz")} className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="btn btn-secondary w-full sm:w-auto border-gray-300 dark:border-[#2A3550] text-gray-700 dark:text-[#E5E7EB] hover:bg-gray-100 dark:hover:bg-[#1A2235]">
              <Target className="w-4 h-4 mr-2" />
              Take Quiz
            </Button>
          </Link>
          <Link to={createPageUrl("Community")} className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="btn btn-secondary w-full sm:w-auto border-gray-300 dark:border-[#2A3550] text-gray-700 dark:text-[#E5E7EB] hover:bg-gray-100 dark:hover:bg-[#1A2235]">
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
          </Link>
        </div>

        {/* Hero Features */}
        <div className="relative max-w-4xl mx-auto px-2">
          <div className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 md:p-6 bg-gray-50 dark:bg-[#121826] rounded-lg">
                <Calculator className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-indigo-400" />
                <p className="font-semibold text-sm text-gray-700 dark:text-[#E5E7EB]">Step-by-Step Solutions</p>
              </div>
              <div className="p-4 md:p-6 bg-gray-50 dark:bg-[#121826] rounded-lg">
                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-indigo-400" />
                <p className="font-semibold text-sm text-gray-700 dark:text-[#E5E7EB]">Visual Graphs</p>
              </div>
              <div className="p-4 md:p-6 bg-gray-50 dark:bg-[#121826] rounded-lg">
                <Lightbulb className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-green-400" />
                <p className="font-semibold text-sm text-gray-700 dark:text-[#E5E7EB]">Key Insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-16 px-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gray-900 dark:text-[#E5E7EB]">
          Everything You Need to Master Maths Solver
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-4 shadow-lg">
            <CardHeader className="card-header bg-gray-50 dark:bg-[#121826] rounded-lg mb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#E5E7EB]">
                <Calculator className="w-4 h-4 text-indigo-400" />
                Multiple Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                Solve problems in derivatives, integrals, limits, functions, trigonometry, algebra, and arithmetic.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-4 shadow-lg">
            <CardHeader className="card-header bg-gray-50 dark:bg-[#121826] rounded-lg mb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#E5E7EB]">
                <Zap className="w-4 h-4 text-indigo-400" />
                Instant Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                Get immediate step-by-step solutions with detailed explanations for every problem.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-4 shadow-lg">
            <CardHeader className="card-header bg-gray-50 dark:bg-[#121826] rounded-lg mb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#E5E7EB]">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Track Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                Monitor your learning journey with statistics and history of all solved problems.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-4 shadow-lg">
            <CardHeader className="card-header bg-gray-50 dark:bg-[#121826] rounded-lg mb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#E5E7EB]">
                <Lightbulb className="w-4 h-4 text-green-400" />
                Learn Better
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                Discover key insights and avoid common mistakes with helpful tips for every solution.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-4 shadow-lg">
            <CardHeader className="card-header bg-gray-50 dark:bg-[#121826] rounded-lg mb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#E5E7EB]">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Export & Save
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                Export solutions as PDF, Markdown, or JSON for offline study and assignment submissions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-4 shadow-lg">
            <CardHeader className="card-header bg-gray-50 dark:bg-[#121826] rounded-lg mb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#E5E7EB]">
                <Target className="w-4 h-4 text-green-400" />
                100% Private
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                All data stored locally on your device. No servers, no tracking, complete privacy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-5xl mx-auto mb-8 md:mb-16 px-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gray-900 dark:text-[#E5E7EB]">
          How It Works
        </h2>

        <div className="space-y-4">
          {[1, 2, 3].map((step) => (
            <Card key={step} className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-4 md:p-6 shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600">
                      {step}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1 text-gray-900 dark:text-[#E5E7EB]">
                      {step === 1 && "Select Your Topic"}
                      {step === 2 && "Enter Your Problem"}
                      {step === 3 && "Get Your Solution"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                      {step === 1 && "Choose from derivatives, integrals, limits, functions, trigonometry, algebra, or arithmetic."}
                      {step === 2 && "Type your math problem or choose from example problems to get started quickly."}
                      {step === 3 && "Receive step-by-step solutions with graphs, tips, and common mistakes to avoid."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-5xl mx-auto mb-8 md:mb-16 px-2">
        <div className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-[#E5E7EB]">
            Why Choose Maths Solver?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "No Sign-Up Required", desc: "Start solving immediately without creating an account" },
              { title: "Completely Free", desc: "All current features at no cost" },
              { title: "Works Offline", desc: "All calculations happen in your browser, no internet needed" },
              { title: "Student-Friendly", desc: "Designed for students by understanding their needs" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-1 text-green-400" />
                <div>
                  <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-[#E5E7EB]">{item.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-[#9CA3AF]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Challenge Section */}
      <div className="max-w-4xl mx-auto mb-8 md:mb-16 px-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8" style={{ color: 'var(--foreground)' }}>
          Daily Challenge
        </h2>
        <DailyChallenge />
      </div>

      {/* Recommended Videos Section */}
      <div className="max-w-5xl mx-auto mb-8 md:mb-16 px-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gray-900 dark:text-[#E5E7EB]">
          Recommended Videos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedVideos.map((video, index) => (
            <Card key={index} className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-4 shadow-lg">
              <CardHeader className="card-header bg-gray-50 dark:bg-[#121826] rounded-lg mb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#E5E7EB]">
                  <Play className="w-4 h-4 text-indigo-400" />
                  {video.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <p className="text-xs mb-4 text-gray-600 dark:text-[#9CA3AF]">
                  {video.description}
                </p>
                <Button
                  onClick={() => handleWatchVideo(video)}
                  className="btn btn-primary w-full bg-red-500 hover:bg-red-600"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Watch
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center px-2">
        <div className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-[#E5E7EB]">
            Ready to Master Maths?
          </h2>
          <p className="text-sm mb-6 text-gray-600 dark:text-[#9CA3AF]">
            Join thousands of students who are learning math with confidence
          </p>
          <Link to={createPageUrl("Solver")} className="inline-block">
            <Button size="lg" className="btn btn-primary bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/25">
              <Calculator className="w-4 h-4 mr-2" />
              Start Solving Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              {selectedVideo?.title || 'Video Tutorial'}
            </DialogTitle>
          </DialogHeader>
          {selectedVideo?.embedUrl && (
            <div className="aspect-video">
              <iframe
                src={selectedVideo.embedUrl}
                title={`Video tutorial for ${selectedVideo.title}`}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setSelectedVideo(null)} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
