

"use client";

import { TimelineCreator } from '@/components/app/timeline-creator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Timeline Creator</h1>
        </div>
        <div className="w-full shadow-lg mt-4">
            <TimelineCreator />
        </div>
      </div>
    </main>
  );

    