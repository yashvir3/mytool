
"use client";

import { TimelineAnalysisTool } from '@/components/app/timeline-analysis-tool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TimelineAnalysisPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full">
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>Timeline Analysis</CardTitle>
                <CardDescription>Analyze an incident timeline to generate a summary.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <TimelineAnalysisTool />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
