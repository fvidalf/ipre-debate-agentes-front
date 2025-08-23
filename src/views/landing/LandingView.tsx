'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ViewLayout, Container, Stack } from '@/components/ui';
import Link from 'next/link';

export default function LandingView() {
  return (
    <ViewLayout background="gradient">
      <Container className="py-16">
        <Stack spacing="xl">
          {/* Header */}
          <header className="text-center">
            <Stack spacing="md">
              <h1 className="text-4xl font-bold text-neutral-900">
                AI Debate Platform
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Create intelligent debates with AI agents. Configure personalities, tools, and watch as artificial minds engage in structured discussions.
              </p>
            </Stack>
          </header>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  AI Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Configure multiple AI agents with distinct personalities and perspectives for rich, diverse debates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🛠️</span>
                  Smart Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Equip your agents with powerful tools like news access, document analysis, and historical debate references.
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Interactive Canvas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualize debate dynamics with an interactive canvas showing agent relationships and argument flows.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="flex justify-center">
            <Card variant="interactive" className="max-w-md">
              <CardContent className="pt-6 text-center">
                <Stack spacing="md">
                  <h3 className="text-lg font-semibold">Ready to Start Debating?</h3>
                  <Link href="/debate">
                    <Button size="lg" className="w-full">
                      Launch Debate Platform
                    </Button>
                  </Link>
                </Stack>
              </CardContent>
            </Card>
          </div>
        </Stack>
      </Container>
    </ViewLayout>
  );
}
