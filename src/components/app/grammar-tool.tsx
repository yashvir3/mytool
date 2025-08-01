
"use client";

import { useState } from "react";
import { correctGrammar } from "@/ai/flows/grammar-correction";
import { simplifyText } from "@/ai/flows/simplify-text";
import { generateComms } from "@/ai/flows/generate-comms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Wind, Trash2, Copy, Check, FilePenLine } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function GrammarTool() {
  const [originalText, setOriginalText] = useState("");
  const [sampleComms, setSampleComms] = useState("");
  const [resultText, setResultText] = useState("");
  const [loadingAction, setLoadingAction] = useState<"grammar" | "simplify" | "generate" | null>(null);
  const [style, setStyle] = useState("Neutral");
  const { toast } = useToast();

  const handleAction = async (action: "grammar" | "simplify" | "generate") => {
    let textToProcess = originalText;
    
    if (action === "generate") {
      const analysisSummary = localStorage.getItem('timelineAnalysis_summary');
      if (!analysisSummary) {
        toast({
          variant: "destructive",
          title: "No Analysis Found",
          description: "Please analyze a timeline first on the 'Timeline Analysis' page.",
        });
        return;
      }
      textToProcess = analysisSummary;
    }

    if (!textToProcess.trim() && action !== 'generate') {
      toast({
        variant: "destructive",
        title: "Text is empty",
        description: "Please enter some text to process.",
      });
      return;
    }

    setLoadingAction(action);
    setResultText("");

    try {
      let result;
      let newText;

      switch(action) {
        case "grammar":
            result = await correctGrammar({ text: textToProcess, style, knowledgeBase: sampleComms });
            newText = (result as any).correctedText;
            break;
        case "simplify":
            result = await simplifyText({ text: textToProcess, style, knowledgeBase: sampleComms });
            newText = (result as any).simplifiedText;
            break;
        case "generate":
            result = await generateComms({ analysis: textToProcess, knowledgeBase: sampleComms });
            newText = (result as any).communication;
            break;
      }
      
      if (newText) {
        if(action === 'generate') {
            setOriginalText(newText);
            setResultText("");
        } else if (newText !== originalText) {
            setResultText(newText);
        } else {
            toast({
              title: "No changes needed",
              description: "Your text is already looking great!",
            });
            setResultText("");
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: `Failed to process text. Please try again.`,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClear = () => {
    setOriginalText("");
    setSampleComms("");
    setResultText("");
    setLoadingAction(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText).then(
      () => {
        toast({
          title: "Copied to clipboard!",
        });
      },
      (err) => {
        toast({
          variant: "destructive",
          title: "Failed to copy",
          description: "Could not copy text to clipboard.",
        });
        console.error("Failed to copy text: ", err);
      }
    );
  };

  const handleAccept = () => {
    setOriginalText(resultText);
    setResultText("");
  };

  const isLoading = loadingAction !== null;

  return (
    <div className="grid w-full gap-6">
      <fieldset disabled={isLoading} className="grid w-full gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="style-select">Writing Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style-select" className="w-full">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="sample-comms">Sample Comms (Optional)</Label>
          <Textarea
            id="sample-comms"
            placeholder="Paste any text here for the AI to learn from (e.g., a style guide, sample documents, or domain-specific terminology)."
            value={sampleComms}
            onChange={(e) => setSampleComms(e.target.value)}
            className="min-h-[150px] resize-y p-4 text-base"
            aria-label="Sample comms for AI"
          />
        </div>

        <Textarea
          placeholder="Start writing here, or generate comms from the timeline analysis..."
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          className="min-h-[200px] resize-y p-4 text-base"
          aria-label="Text to process"
        />

        {resultText && (
          <div className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95" data-state="open">
              <Card className="bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 shadow-sm">
                  <CardHeader>
                      <CardTitle className="text-lg text-green-900 dark:text-green-300">Suggestion</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-base text-foreground">{resultText}</p>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={handleAccept}>
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                      </Button>
                  </CardFooter>
              </Card>
          </div>
        )}
      </fieldset>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
        <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleAction("grammar")} disabled={isLoading}>
                {loadingAction === 'grammar' ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Correct Grammar
            </Button>
            <Button variant="secondary" onClick={() => handleAction("simplify")} disabled={isLoading}>
                {loadingAction === 'simplify' ? <Loader2 className="animate-spin" /> : <Wind />}
                Simplify
            </Button>
            <Button variant="secondary" onClick={() => handleAction("generate")} disabled={isLoading}>
                {loadingAction === 'generate' ? <Loader2 className="animate-spin" /> : <FilePenLine />}
                Generate Comms from Analysis
            </Button>
        </div>
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={isLoading || (!originalText && !resultText && !sampleComms)}
          className="text-muted-foreground"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
