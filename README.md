# The Intentional System

A holistic productivity platform integrating purpose, process, and psychology to align daily actions with spiritual and long-term fulfillment.

## Overview

The Intentional System is a React-based Progressive Web App (PWA) designed to help users manage their time and attention. Unlike standard to-do lists, it combines the Eisenhower Matrix for prioritization, time blocking for scheduling, and deep work timers for execution, all grounded in the user's higher purpose ("Niyyah").

## Core Philosophy

1.  **Purpose (Niyyah)**: Every action begins with intention.
2.  **Process (Structure)**: Order creates freedom.
3.  **Psychology (Growth)**: Understanding the mind improves execution.

## Key Features

*   **Dashboard**: A central hub for daily intentions, main objectives, and quick stats.
*   **Task Matrix**: An interactive Eisenhower Matrix to categorize tasks by urgency and importance.
*   **Time Structurer**: A weekly planner to map "Ideal Week" vs. "Reality" using time blocking.
*   **Focus Layer**: A dedicated focus mode with ambient sounds, timers, and environment checklists to facilitate deep work.
*   **Psychology Layer**: Tools for active recall (Flashcards) and understanding concepts (Feynman Board).
*   **Analytics**: Visual insights into task completion, schedule adherence, and energy allocation.
*   **Reward Shop**: A gamified system to redeem "blocks" earned from tasks for guilt-free leisure.
*   **Cloud Sync**: Real-time data synchronization using Supabase.

## Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **State Management**: Local React State + Supabase Sync
*   **Backend / Database**: Supabase (PostgreSQL)
*   **Routing**: React Router DOM

## Setup and Installation

### Prerequisites
*   Node.js (v16+)
*   npm or yarn

### Steps

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd intentional-system
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configuration**:
    The Supabase configuration is currently located in `services/supabaseClient.ts`. For a production environment, move these credentials to a `.env` file:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_KEY=your_supabase_anon_key
    ```

4.  **Database Fixes**:
    To resolve Supabase dashboard warnings (RLS & Indexes), copy the contents of `supabase_fixes.sql` and run them in your Supabase SQL Editor.

5.  **Run the development server**:
    ```bash
    npm run dev
    ```

6.  **Build for production**:
    ```bash
    npm run build
    ```

## Project Structure

*   `src/components/`: UI components organized by feature layer.
*   `src/hooks/`: Custom React hooks (sound, data sync, etc.).
*   `src/services/`: External service integrations (Supabase).
*   `src/types.ts`: TypeScript definitions and initial state.
*   `src/utils/`: Helper functions and translation logic.

## Usage Guide

1.  **Login**: Enter your name and email to identify your session and sync data.
2.  **Dashboard**: Start your day here. Define your "Niyyah" (Intention) and check your "Daily Quests".
3.  **Tasks**: Use the Matrix to capture tasks. Drag and drop to prioritize.
4.  **Plan**: Assign tasks to time slots in the Time Structurer.
5.  **Focus**: Enter Focus Mode to execute specific tasks with a timer.
6.  **Review**: At the end of the week, use the Weekly Review to reflect and adjust.

## License

Proprietary. All rights reserved.