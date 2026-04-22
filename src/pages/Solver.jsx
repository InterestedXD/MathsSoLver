import React, { useState } from "react";
import ProblemInput from "@/components/solver/ProblemInput";
import SolutionDisplay from "@/components/solver/SolutionDisplay";
import GraphViewer from "@/components/solver/GraphViewer";
import { solveProblem, createProblemHistory, getVideoRecommendation } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Solver() {
  usePageTitle("Solver - Step-by-Step Math Solutions");
  const [problem, setProblem] = useState("");
  const [topic, setTopic] = useState("");
  const [solution, setSolution] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [videoRecommendation, setVideoRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSolve = async () => {
    setIsLoading(true);
    try {
      const result = await solveProblem(problem, topic);
      setSolution(result);
      setGraphData(result.graph);

      // Save to problem history
      await createProblemHistory({
        problem,
        topic,
        solution: result,
        feedback: "Solved successfully"
      });

      // Get video recommendation
      try {
        const videoResult = await getVideoRecommendation(problem, topic);
        setVideoRecommendation(videoResult);
      } catch (videoError) {
        console.warn("Failed to get video recommendation:", videoError);
        setVideoRecommendation(null);
      }

      toast.success("Problem solved successfully!");
    } catch (error) {
      console.error("Error solving problem:", error);
      toast.error("Failed to solve problem. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E5E7EB] mb-2">
          Let's Master Some Math!
        </h1>
        <p className="text-gray-600 dark:text-[#9CA3AF]">
          Enter any precalculus or calculus problem and I'll guide you through it step-by-step
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl p-6 shadow-lg">
            <ProblemInput
              problem={problem}
              setProblem={setProblem}
              topic={topic}
              setTopic={setTopic}
              onSolve={handleSolve}
              isLoading={isLoading}
            />
          </div>

          <GraphViewer functionData={graphData} />
        </div>

        <div>
          <SolutionDisplay solution={solution} problem={problem} topic={topic} videoRecommendation={videoRecommendation} />
        </div>
      </div>
    </div>
  );
}
