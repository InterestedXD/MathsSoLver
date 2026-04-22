import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, BookOpen, Lightbulb, Download, ChevronDown, Play, X } from "lucide-react";
import { motion } from "framer-motion";
import { exportSolutionAsMarkdown, exportSolutionAsJSON, exportSolutionAsPDF } from "@/lib/exportUtils";
import { useToast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TOPIC_LABELS = {
  derivatives: "Derivatives",
  integrals: "Integrals",
  limits: "Limits",
  functions: "Functions",
  trigonometry: "Trigonometry",
  algebra: "Algebra",
  other: "Arithmetic"
};

export default function SolutionDisplay({ solution, problem, topic, videoRecommendation }) {
  const toast = useToast();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleExportSolution = (format) => {
    if (!solution || !problem || !topic) return;

    try {
      switch (format) {
        case 'pdf':
          exportSolutionAsPDF(problem, topic, solution, TOPIC_LABELS);
          toast.success("Solution exported as PDF");
          break;
        case 'markdown':
          exportSolutionAsMarkdown(problem, topic, solution, TOPIC_LABELS);
          toast.success("Solution exported as Markdown");
          break;
        case 'json':
          exportSolutionAsJSON(problem, topic, solution);
          toast.success("Solution exported as JSON");
          break;
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export solution");
    }
  };
  if (!solution) {
    return (
      <Card className="bg-[#1A2235] border-2 border-[#2A3550] shadow-lg rounded-xl">
        <CardHeader className="border-b border-[#2A3550] bg-[#121826]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#E5E7EB]">
            <BookOpen className="w-6 h-6 text-green-400" />
            Solution & Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
              <BookOpen className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-[#9CA3AF] text-lg">
              Your solution will appear here!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-[#1A2235] border-2 border-[#2A3550] shadow-lg rounded-xl">
        <CardHeader className="border-b border-[#2A3550] bg-[#121826]">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl text-[#E5E7EB]">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              Solution & Explanation
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2A3550] text-[#E5E7EB] hover:bg-[#2A3550] hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1A2235] border-[#2A3550]">
                <DropdownMenuItem onClick={() => handleExportSolution('pdf')} className="text-[#E5E7EB] focus:bg-[#2A3550]">
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSolution('markdown')} className="text-[#E5E7EB] focus:bg-[#2A3550]">
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSolution('json')} className="text-[#E5E7EB] focus:bg-[#2A3550]">
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {solution.steps && solution.steps.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-[#E5E7EB]">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Step-by-Step Solution:
              </h3>
              <div className="space-y-3">
                {solution.steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl bg-[#121826] border-l-4 border-indigo-500"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-[#E5E7EB] flex-1 leading-relaxed">{step}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {solution.answer && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-[#E5E7EB] mb-2">Final Answer:</h3>
                  <p className="text-[#E5E7EB] text-xl font-semibold">{solution.answer}</p>
                </div>
              </div>
            </div>
          )}

          {solution.tips && solution.tips.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-[#E5E7EB]">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                Key Insights:
              </h3>
              <div className="space-y-2">
                {solution.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#121826] border border-amber-500/30"
                  >
                    <p className="text-[#9CA3AF]">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {solution.common_mistakes && solution.common_mistakes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-[#E5E7EB]">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Common Mistakes to Avoid:
              </h3>
              <div className="space-y-2">
                {solution.common_mistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#121826] border border-red-500/30"
                  >
                    <p className="text-[#9CA3AF]">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Recommendation Section */}
          {videoRecommendation && (
            <div className="space-y-3 pt-4 border-t border-[#2A3550]">
              {videoRecommendation.videoUrl ? (
                <div className="flex flex-col items-center space-y-3">
                  <Button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-200"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    🎬 Watch Video Explanation
                  </Button>
                  <p className="text-sm text-[#9CA3AF] text-center">
                    {videoRecommendation.message}
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 rounded-lg bg-[#121826] border border-[#2A3550]">
                  <p className="text-[#9CA3AF]">
                    {videoRecommendation.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-600" />
                Video Explanation: {videoRecommendation?.concept}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVideoModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 pt-0">
            {videoRecommendation?.videoUrl && (
              <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden">
                <iframe
                  src={videoRecommendation.videoUrl}
                  title={`Video explanation for ${videoRecommendation.concept}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
