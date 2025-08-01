
"use client";

import { CanReportTool } from '@/components/app/can-report-tool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CanReportPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full">
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>CAN Report</CardTitle>
                <CardDescription>Structure your incident report using the Condition, Action, and Need format. Publish it directly to an incident timeline.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <CanReportTool />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
