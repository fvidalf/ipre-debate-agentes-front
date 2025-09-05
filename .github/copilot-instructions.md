# Copilot Instructions

## What's this project about?
This repo contains the frontend code for a web application that simulates debates using AI agents. It lets users create their own debate configurations, including topics, participants, prompts, tools and more. This app is built using Next.js and TypeScript.

## Architecture
Inside the src directory you'll find the main views and components of the application.
src/
├── app/                  # Next.js app directory with pages and layouts
│  ├── editor/            # Debate editor page, including a canvas and a tool vertical menu for editing the configuration. Takes a config ID as a param.
│  ├── debate/            # Old editor page. Will be removed in future.
│  ├── my-debates/        # Page listing all user-created debates.
│  ├── simulation/        # Page showing the debate simulation in action. Takes a simulation ID as a param.
│  components/            # Reusable components used across different pages.
│  hooks/                 # Custom React hooks for state management and side effects. This folder contains key hooks for the app's functionality.
│  ├── useDebateApp.ts    # Main orchestration hook that manages the overall functionality of the app.
│  ├── useEditorConfig.ts # Hook for managing the debate configuration state and logic. Handles adding, removing, and updating participants, prompts, and tools. Particularly important for the editor page.
│  ├── useCanvasState.ts  # Hook for managing the canvas state, including zooming, panning, and positioning of elements. Used in the editor page. Manages the visual layout of the debate configuration (in this app, they a configuration is represented by both its data and its visual layout on the canvas).
│  ├── useConfigs.ts      # Hook for fetching and managing saved debate configurations from the backend API. Used in the my-debates page.
│  ├── useSimulationControl.ts # Hook for controlling the simulation state, including starting, pausing, and stopping the debate simulation. Used in the simulation page.
│  ├── useAgentFactory.ts # Hook used for creating and managing the visual representation of agents on the canvas. Used in the editor page.
│  ├── useAgentTemplates.ts # Hook for fetching and managing agent templates from the backend API. Used in the editor page.
│  ├── useUIState.ts
├── lib/
│  ├── agentUtils.ts
│  ├── api.ts             # API client for interacting with the backend services.
│  ├── cn.ts
├── styles/
│  ├── patterns.ts        # CSS style patterns used in the app.
│  ├── tokens.ts          # Design tokens for colors, fonts, and spacing.
├── views/                # Contains 


## Other relevant information
- You can find the backend API documentation in the root API_DOCUMENTATION.md file.

## General guidelines
- Follow the existing coding style and conventions used in the project. Try to keep the code consistent and reuse existing components and utilities whenever possible.
- Write clear and concise code, with meaningful variable and function names. Prefer shorter functions that do one thing well instead of having to read through long blocks of code and comments. Don't over-comment obvious things.

