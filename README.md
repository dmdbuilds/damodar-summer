# Damodar OS — Personal Summer Dashboard

A full-stack progressive web app built as a personal operating system for the summer. Time-aware home page, AI-powered gym trainer, meal prep hub, certification tracker, and study spot randomizer.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- OpenAI API (GPT-4o) — AI gym trainer, multi-mode assistant, day planner
- Notion API — live certification tracker
- Web Speech API — voice input and text-to-speech
- Vercel — deployment
- PWA — installable on iOS and desktop

## Features

### Home — Time-Aware Dashboard
Reads current time and surfaces exactly what you should be doing right now. Changes dynamically across 12 daily schedule blocks. Shows current workout phase, week number, daily checklist, and a randomized motivational line.

### Gym Trainer (AI)
Week 1 calibration flow — logs real weights and generates a personalized plan via GPT-4o. Every subsequent session adapts weights based on performance. Tracks progressive overload with charts. Supports 4-day push/pull/lower/full split with integrated calisthenics skill work.

### Meal Prep Hub
Full recipe system with serving scaler. Sunday prep checklist. Daily protein tracker toward 130g target. Built around vegetarian, no-egg diet with Indian food integration.

### Certifications
Live data from Notion API. Tracks 10 certifications including CS50X, CS50 for Business, Google AI Essentials, AWS AI Practitioner, and more. Progress bar, weekly cert highlight, status badges.

### Study Spot Randomizer
Filters 6 local spots by current time, open hours, and time available before gym. Generates a Google Maps navigation link. Accounts for 1-hour minimum session requirement.

### AI Assistant — 5 Modes
Single chat interface that transforms context and personality across: Gym Trainer, Sous Chef, Chem Tutor, Cert Coach, and Day Planner. Voice input via Web Speech API with text-to-speech responses.

## Local Development
```bash
npm install
npm run dev
```

## Environment Variables
```
OPENAI_API_KEY=
NOTION_API_KEY=
NOTION_CERTS_DB_ID=
```

## Context
Built summer 2025. Part of a broader personal OS vision including Jarvis (autonomous AI assistant) and Clear Safe (Arduino-based smart safe). FRC Robotics Team 7419, Innovation Nexus club founder, Quarry Lane High School.
