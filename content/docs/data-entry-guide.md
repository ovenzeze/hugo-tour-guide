---
title: Data Entry Guide for Museums, Galleries and Objects
description: Comprehensive guide to entering and managing museum data in the Hugo Tour Guide system
author: Zhen@Hugo
date: 2024-05-02
updatedAt: 2024-05-15
tags: ["data-entry", "museums", "galleries", "objects", "guide"]
---

## Overview

Hugo Tour Guide system uses a layered architecture to manage museum data, from museums and galleries to objects, guide texts and audio. This guide will detail the data entry process and important considerations for each type of data.

Proper data entry is fundamental to generating high-quality guide content. The system supports rich metadata to enable personalized, information-rich museum tour experiences.

## Data Models and Relationships

The core data models include the following components:

```
museums
   ↓
galleries
   ↓
objects
   ↑
   |
personas → guide_texts → guide_audios
```

This hierarchical structure allows:
- One museum contains multiple galleries
- One gallery contains multiple objects
- Each entity (museum/gallery/object) can have multiple guide texts
- Each guide text can have multiple audio versions (different personas, different languages)

## Data Entry Process

Data entry must follow a specific order to ensure referential integrity:

### Museum Entry

First, create museum records as the top level of the data hierarchy.

**Required Fields**:
- `name`: Museum name (must be unique)

**Recommended Fields**:
- `description`: Museum description
- `address`: Address
- `city`: City
- `country`: Country
- `website`: Website
- `logo_url`: Logo URL
- `cover_image_url`: Cover image URL

**Example SQL**:
```sql
INSERT INTO museums (name, description, city, country)
VALUES ('The Metropolitan Museum of Art', 'One of the largest art museums in the United States', 'New York', 'USA')
RETURNING museum_id;
```

### Gallery Entry

Create gallery records that must be associated with an existing museum.

**Required Fields**:
- `museum_id`: Parent museum ID
- `name`: Gallery name (must be unique within the same museum)

**Recommended Fields**:
- `gallery_number`: Gallery number
- `description`: Gallery description
- `theme`: Gallery theme
- `location_description`: Location description
- `floor_plan_coordinate`: Floor plan coordinates (JSONB)

**Example SQL**:
```sql
INSERT INTO galleries (museum_id, name, gallery_number, description, theme)
VALUES (1, 'Egyptian Art', 'G-101', 'Showcasing ancient Egyptian artifacts', 'Ancient Civilizations')
RETURNING gallery_id;
```

### Object Entry

Create object records that must be associated with an existing museum and optionally with a gallery.

**Required Fields**:
- `museum_id`: Parent museum ID
- `object_id`: Object ID (typically using museum's internal numbering system)
- `title`: Object title

**Recommended Fields**:
- `gallery_id`: Parent gallery ID
- `object_number`: Object number
- `artist_display_name`: Artist name
- `culture`: Cultural background
- `period`: Period
- `object_date`: Object date
- `medium`: Medium
- `description`: Description
- `image_url`: Image URL
- `tags`: Tag array

**Example SQL**:
```sql
INSERT INTO objects (museum_id, gallery_id, object_id, title, artist_display_name, period, description, image_url)
VALUES (1, 2, 12345, 'Tutankhamun Golden Mask', 'Ancient Egyptian Craftsmen', 'New Kingdom', 'Pure gold mask made in 1323 BC', 'https://example.com/mask.jpg')
RETURNING object_id;
```

### Persona Creation

Create guide personas for generating different styles of guide content.

**Required Fields**:
- `name`: Persona name (must be unique)

**Recommended Fields**:
- `description`: Persona description
- `avatar_url`: Avatar URL
- `voice_model_identifier`: Voice model ID (ElevenLabs)
- `language_support`: Supported languages array

**Example SQL**:
```sql
INSERT INTO personas (name, description, voice_model_identifier, language_support)
VALUES ('Art Historian Anna', 'Scholar specializing in ancient civilizations', 'eleven_voice_id_123', ARRAY['en', 'zh', 'fr'])
RETURNING persona_id;
```

### Guide Text Creation

Create guide texts associated with personas and target entities (museum/gallery/object).

**Required Fields**:
- `persona_id`: Persona ID
- `language`: Language code
- `transcript`: Guide text content
- Choose one of the following three (CHECK constraint ensures only one non-NULL):
 - `museum_id`: Museum ID
 - `gallery_id`: Gallery ID
 - `object_id`: Object ID

**Example SQL**:
```sql
INSERT INTO guide_texts (persona_id, language, object_id, transcript)
VALUES (1, 'en', 12345, 'This golden mask of Tutankhamun was discovered in 1922...')
RETURNING guide_text_id;
```

## Field Descriptions

### Main Museum Fields

| Field Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| museum_id | INTEGER | Auto-increment primary key | 1 |
| name | TEXT | Museum name (unique) | 'British Museum' |
| description | TEXT | Museum description | 'One of the oldest public museums in the world...' |
| address | TEXT | Address | 'Great Russell St, London' |
| city | TEXT | City | 'London' |
| country | TEXT | Country | 'United Kingdom' |
| opening_hours | JSONB | Opening hours (JSON format) | {"mon":"9:00-17:00","tue":"9:00-17:00"} |

### Main Gallery Fields

| Field Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| gallery_id | INTEGER | Auto-increment primary key | 2 |
| museum_id | INTEGER | Parent museum ID | 1 |
| name | TEXT | Gallery name | 'Egyptian Gallery' |
| gallery_number | TEXT | Gallery number | 'G-101' |
| floor_plan_coordinate | JSONB | Floor plan coordinates | {"x":120,"y":80,"width":50,"height":30} |

### Main Object Fields

| Field Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| object_id | BIGINT | Primary key | 12345 |
| museum_id | INTEGER | Parent museum ID | 1 |
| gallery_id | INTEGER | Parent gallery ID (nullable) | 2 |
| title | TEXT | Object title | 'Rosetta Stone' |
| artist_display_name | TEXT | Artist name | 'Unknown' |
| period | TEXT | Period | 'Ptolemaic Dynasty' |
| description | TEXT | Description | 'Multilingual stone from 196 BC...' |
| tags | TEXT[] | Tag array | {'stone', 'ancient egypt', 'multilingual'} |

### Main Persona Fields

| Field Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| persona_id | INTEGER | Auto-increment primary key | 1 |
| name | TEXT | Persona name | 'Art Historian Anna' |
| voice_model_identifier | TEXT | ElevenLabs voice ID | 'eleven_voice_id_123' |
| language_support | TEXT[] | Supported languages | {'en', 'zh', 'fr'} |

### Main Guide Text Fields

| Field Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| guide_text_id | INTEGER | Auto-increment primary key | 5 |
| persona_id | INTEGER | Persona ID | 1 |
| language | VARCHAR(10) | Language code | 'en' |
| museum_id | INTEGER | Museum ID (nullable) | NULL |
| gallery_id | INTEGER | Gallery ID (nullable) | 2 |
| object_id | BIGINT | Object ID (nullable) | NULL |
| transcript | TEXT | Text content | 'Welcome to the Egyptian Gallery...' |
| version | INTEGER | Version number | 1 |
| is_latest_version | BOOLEAN | Is latest version | true |

## Validation Rules

The system includes multiple validation rules to ensure data integrity:

1. **Uniqueness Constraints**:
   - Museum names must be unique
   - Gallery names must be unique within the same museum
   - Persona names must be unique

2. **Referential Integrity**:
   - Galleries must be associated with valid museums
   - Objects must be associated with valid museums (optionally with galleries)
   - Guide texts must be associated with valid personas and target entities

3. **CHECK Constraints**:
   - Guide texts and audio target entities (museum_id, gallery_id, object_id) must have exactly one non-NULL value

4. **Cascade Deletes**:
   - Deleting a museum cascades to related galleries, objects, guide texts, and audio
   - Deleting a gallery cascades to related objects, guide texts, and audio (if associated)
   - Deleting an object cascades to related guide texts and audio (if associated)

## Best Practices

### Data Organization

1. **Structure Data Logically**:
   - Place shared information at museum and gallery levels
   - Place specific information at object level
   - Consider visitor tour experience when designing content hierarchy

2. **Complete Metadata**:
   - Fill in as many metadata fields as possible
   - Pay special attention to tags field for search and categorization
   - Use standardized terms for periods, cultures, and media

3. **Multilingual Support**:
   - Create separate guide texts for each supported language
   - Ensure audio matches corresponding language text

### Content Optimization

1. **Personas and Styles**:
   - Create different personas for different types of guide content
   - Examples: Academic expert, children's guide, storyteller
   - Maintain consistent persona tone and style

2. **Guide Text Writing**:
   - Optimize text for voice synthesis
   - Avoid overly complex sentence structures
   - Consider pronunciation of terms and names
   - Include natural pauses and transitions

3. **Version Management**:
   - Use version numbers and is_latest_version flag to track content updates
   - Retain old versions for reference and rollback

## Common Issues

### Data Entry Errors

1. **Unique Constraint Violations**:
   - Check if museum names, gallery name combinations, or persona names already exist
   - Use ON CONFLICT clauses to handle conflicts

2. **Foreign Key Violations**:
   - Ensure referenced entities exist (museums, galleries, personas)
   - Follow correct hierarchical order for data creation

3. **CHECK Constraint Violations**:
   - Guide texts and audio can only be associated with one target entity
   - Ensure only one non-NULL target ID is provided

### Data Management Issues

1. **Bulk Data Import**:
   - Use bulk import tools
   - Import base entities before related entities
   - Use temporary tables for data cleaning and validation

2. **Content Updates**:
   - Create new versions instead of overwriting old content
   - Update related audio content
   - Consider compatibility with old content

3. **Resource Management**:
   - Provide high-quality images for museums, galleries, and objects
   - Consider using CDN for image storage and distribution
   - Optimize image sizes to balance quality and loading speed
