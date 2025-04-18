# Tour Page Functionality Overview

## Core Concept

The Tour page is designed as an interactive museum guide with voice-first interaction. It provides users with an immersive experience exploring the Metropolitan Museum through an AI-powered virtual guide.

## Key Components

### 1. Voice-First Navigation
- **Automatic Introduction**: When users enter the page, the guide automatically begins a brief, conversational introduction to the museum
- **Voice Interaction**: Users primarily interact with the page through voice commands
- **Context-Aware Explanations**: The guide provides more detailed explanations when users interact with specific elements

### 2. Interactive Map Experience
- **Multi-floor Navigation**: Users can switch between floors using elegant animated transitions
- **Exhibit Highlighting**: Points of interest are highlighted on the map as users navigate or ask about them
- **Interactive Elements**: Map responds to user clicks and movements with fluid animations
- **Zoom Controls**: Users can zoom in/out to focus on specific areas

### 3. Guide Interface
- **Persistent Guide Avatar**: Fixed position at the bottom left showing the guide's avatar
- **Speaking Animation**: Avatar animates when the guide is speaking to enhance engagement
- **Hold-to-Ask Button**: Located at the bottom right, users can press and hold to speak directly to the guide

### 4. Content Display
- **Dynamic Content Updates**: Middle section displays venue and exhibit information
- **Context-Sensitive Content**: Information updates based on map interactions and user questions
- **Smooth Transitions**: All content changes feature elegant animations for a polished experience

### 5. Technical Implementation Notes
- **Voice Interface Priority**: All interactions are designed voice-first, with visual elements as support
- **Text Display Options**: Voice interactions don't show text by default, but users can access text through a specific button
- **Seamless Animation Flow**: All transitions between states should feel natural and smooth

## User Flow

1. **Page Load**: 
   - Map initializes showing the first floor
   - Guide automatically introduces the museum with a brief overview
   - Animation sequence reveals UI elements in a pleasing order

2. **Exploration Mode**:
   - Users explore the map by panning and zooming
   - Clicking on exhibits triggers the guide to explain them
   - Floor selector allows switching between levels

3. **Guided Experience**:
   - "Recommended Route" section shows optimized path through museum
   - Clicking items in the route highlights them on the map
   - Guide provides context-appropriate information for each stop

4. **Direct Interaction**:
   - Users hold the "Ask Guide" button to ask specific questions
   - Voice recognition captures the question
   - Guide responds with relevant information
   - No text transcript appears unless specifically requested

## Implementation Requirements

1. **Map Component Updates**:
   - Enhance the MuseumMap component with smoother animations
   - Add transition effects between floor switches
   - Implement gesture controls for mobile devices

2. **Voice Interface Enhancements**:
   - Set up automatic welcome narration on page load
   - Configure context-aware responses based on user location/focus
   - Add visual feedback on guide avatar when speaking

3. **Bottom Toolbar**:
   - Create fixed toolbar at bottom of screen
   - Add animated guide avatar on left side
   - Implement hold-to-speak functionality for the Ask button

4. **Animation System**:
   - Use v-motion directives for fluid transitions
   - Ensure consistent animation style across all components
   - Optimize performance for smooth experiences on all devices
