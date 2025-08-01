
"use client";

import { CalloutGroupTool } from '@/components/app/callout-group-tool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CalloutGroupPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full">
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>Call Out Group</CardTitle>
                <CardDescription>Search for a team to page, add new teams, and manage the call out list.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <CalloutGroupTool showAdd={true} showRemove={true} />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
