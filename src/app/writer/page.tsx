
"use client";

import { GrammarTool } from '@/components/app/grammar-tool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WriterPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full">
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>Grammar & Style Corrector</CardTitle>
                <CardDescription>Refine your writing with the power of AI. Select a style and provide a knowledge base to personalize the suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <GrammarTool />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
