---
title: "Tour Page Functionality Overview"
description: "交互式博物馆导览功能概述和说明"
---

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

## 设计差异分析

当前实现与目标设计存在一些重要差异，需要进一步调整以实现更好的用户体验：

### 1. 地图中心化设计

**目标设计**:
- 地图应作为主要内容区域，占据页面的大部分空间
- 所有主要交互控件应直接集成在地图界面上
- 楼层切换、展品标记和导航元素应作为地图叠加层

**当前实现**:
- 地图仅作为页面的一个组件，与其他内容并列
- 导览路线和展品信息独立于地图，作为分离的区块展示
- 用户必须在地图和内容区域之间来回切换注意力

### 2. 交互模式差异

**目标设计**:
- 所有交互主要通过地图界面完成
- 展品标记直接在地图上高亮显示，点击后显示详情
- 楼层切换控件集成在地图上，便于直观操作

**当前实现**:
- 交互分散在多个界面区域
- "Recommended Route"部分与地图分离
- 展品详情显示在独立区域，而非地图叠加层

### 3. 视觉层次结构

**目标设计**:
- 建立清晰的视觉层次，以地图为焦点
- 辅助信息应作为浮动层或叠加层呈现
- 简化界面，减少分散用户注意力的元素

**当前实现**:
- 视觉重点分散，地图与其他内容区域权重相近
- 界面元素垂直排列，缺乏层次感
- 页面过于分段，降低了沉浸式体验

### 4. 空间利用效率

**目标设计**:
- 最大化地图显示区域，提高空间利用效率
- 控件采用最小化设计，需要时才展开
- 展品详情应采用叠加式设计，不占用地图显示空间

**当前实现**:
- 空间分配不均，地图区域受限
- 多个固定内容区块降低了地图可视面积
- 页面垂直滚动较长，影响整体视图的获取

以上差异需要在后续迭代中解决，以实现更加以地图为中心的交互模式，提升用户导览体验的直观性和效率。
