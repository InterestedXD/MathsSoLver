import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Lightbulb, AlertCircle } from "lucide-react";
import { validateMathInput, validateTopic, sanitizeInput } from "@/lib/validation";

const TOPICS = [
  { value: "derivatives", label: "Derivatives" },
  { value: "integrals", label: "Integrals" },
  { value: "limits", label: "Limits" },
  { value: "functions", label: "Functions" },
  { value: "trigonometry", label: "Trigonometry" },
  { value: "algebra", label: "Algebra" },
  { value: "other", label: "Arithmetic" }
];

const PLACEHOLDERS = {
  derivatives: "e.g., x^2 + 3*x or Find the derivative of x^3 - 2*x",
  integrals: "e.g., 2*x + 1 or Integrate x^2",
  limits: "e.g., lim x->0 (sin(x)/x) or (x^2 - 4)/(x - 2) as x->2",
  functions: "e.g., x^2 - 4*x + 3 or f(x) = x^3 - x",
  trigonometry: "e.g., sin(pi/4) or cos(60) or tan(x)",
  algebra: "e.g., 2*x + 5 = 11 or x^2 - 4 or (x + 2)*(x - 3)",
  other: "e.g., 15 + 23, 8 * 7, (5 + 3) * 4, 2^3 + 10/2"
};

const EXAMPLE_PROBLEMS = [
  { topic: "derivatives", problem: "x^2 + 3*x" },
  { topic: "integrals", problem: "2*x + 1" },
  { topic: "limits", problem: "lim x->0 (sin(x)/x)" },
  { topic: "functions", problem: "x^2 - 4*x + 3" },
  { topic: "algebra", problem: "2*x + 5 = 11" },
  { topic: "trigonometry", problem: "sin(pi/4)" },
  { topic: "other", problem: "(5 + 3) * 4 - 2^3" }
];

export default function ProblemInput({ problem, setProblem, topic, setTopic, onSolve, isLoading }) {
  const [validationError, setValidationError] = useState(null);

  const loadExample = (exampleProblem) => {
    setProblem(exampleProblem.problem);
    setTopic(exampleProblem.topic);
    setValidationError(null);
  };

  const handleProblemChange = (e) => {
    // Allow all input, only sanitize when validating
    setProblem(e.target.value);
    setValidationError(null);
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (problem.trim() && topic && !isLoading) {
        handleSolve();
      }
    }
    // Shift+Enter creates a new line (default behavior)
  };

  const handleSolve = () => {
    // Validate topic
    const topicValidation = validateTopic(topic);
    if (!topicValidation.isValid) {
      setValidationError(topicValidation.error);
      return;
    }

    // Sanitize and validate math input
    const sanitized = sanitizeInput(problem);
    const inputValidation = validateMathInput(sanitized);
    if (!inputValidation.isValid) {
      setValidationError(inputValidation.error);
      return;
    }

    setValidationError(null);
    onSolve();
  };

  // Get the display label for the selected topic
  const selectedLabel = TOPICS.find(t => t.value === topic)?.label || "Select a topic";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-lg font-semibold text-[#E5E7EB]">
          What are you working on?
        </Label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="h-12 text-lg bg-[#121826] border border-[#2A3550] text-[#E5E7EB] focus:ring-2 focus:ring-indigo-500 rounded-xl">
            <SelectValue placeholder="Select a topic">
              {selectedLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#1A2235] border-[#2A3550]">
            {TOPICS.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-lg text-[#E5E7EB] focus:bg-[#2A3550]">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem" className="text-lg font-semibold text-[#E5E7EB]">
          Enter your problem
        </Label>
        <Textarea
          id="problem"
          value={problem}
          onChange={handleProblemChange}
          onKeyDown={handleKeyDown}
          placeholder={topic ? PLACEHOLDERS[topic] : "Select a topic first, then enter your problem..."}
          className={`min-h-32 text-lg bg-[#121826] border ${
            validationError ? 'border-red-500 focus:border-red-400' : 'border-[#2A3550] focus:border-indigo-500'
          } rounded-xl p-4 resize-none text-[#E5E7EB] placeholder:text-[#6B7280]`}
          maxLength={1000}
        />
        <p className="text-xs text-[#6B7280]">
          {problem.length}/1000 characters
        </p>
      </div>

      {validationError && (
        <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{validationError}</p>
        </div>
      )}

      <Button
        onClick={handleSolve}
        disabled={!problem.trim() || !topic || isLoading}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 rounded-xl"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
            Solving...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Solve Problem
          </>
        )}
      </Button>

      <div className="pt-4 border-t border-[#2A3550]">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-[#E5E7EB]">Try an example:</span>
        </div>
        <div className="grid gap-2">
          {EXAMPLE_PROBLEMS.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => loadExample(ex)}
              className="text-left p-3 rounded-lg bg-[#121826] hover:bg-[#1A2235] transition-all duration-200 border border-[#2A3550] text-sm"
            >
              <span className="font-medium text-indigo-400 capitalize">{ex.topic}:</span>{" "}
              <span className="text-[#9CA3AF]">{ex.problem}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}