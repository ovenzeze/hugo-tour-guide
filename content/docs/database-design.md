---
title: Database Design Documentation
description: Detailed documentation of the database schema for Hugo Tour Guide
author: Zhen Zhang@Hugo
date: 2024-05-02
updatedAt: 2024-05-15
tags: ["database", "schema", "design", "supabase"]
---


Hugo Tour Guide uses a PostgreSQL database hosted on Supabase to store all application data. The schema is designed around a hierarchical model where museums contain galleries, which contain objects. Each entity (museum, gallery, or object) can have multiple guide texts and associated audio recordings.

The design prioritizes:
- Relational integrity with appropriate foreign key constraints
- Efficient querying for common access patterns
- Flexibility to support different types of museums and content
- Support for multiple languages and personas

## Entity Relationship Diagram

```
                 ┌─────────────┐
                 │   museums   │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  galleries  │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   objects   │
                 └──────┬──────┘
                        │
                        │      ┌─────────────┐
                        │      │  personas   │
                        │      └──────┬──────┘
                        │             │
                        ▼             ▼
                 ┌─────────────────────────┐
                 │      guide_texts        │
                 └───────────┬─────────────┘
                             │
                             ▼
                 ┌─────────────────────────┐
                 │      guide_audios       │
                 └─────────────────────────┘
```

## Database Tables

### museums

Stores information about museums.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| museum_id | integer | PRIMARY KEY | Auto-incrementing unique identifier |
| name | text | NOT NULL, UNIQUE | Museum name |
| description | text | | Description of the museum |
| address | text | | Physical address |
| city | text | | City where the museum is located |
| country | text | | Country where the museum is located |
| website | text | | Museum's official website URL |
| logo_url | text | | URL to the museum's logo image |
| cover_image_url | text | | URL to the museum's cover image |
| opening_hours | jsonb | | Opening hours in JSON format |
| created_at | timestamp with time zone | DEFAULT now() | Record creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Record last update timestamp |

### galleries

Represents exhibition galleries within museums.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| gallery_id | integer | PRIMARY KEY | Auto-incrementing unique identifier |
| museum_id | integer | NOT NULL, FOREIGN KEY | Reference to parent museum |
| name | text | NOT NULL | Gallery name |
| gallery_number | text | | Gallery identifier within museum |
| description | text | | Description of the gallery |
| theme | text | | Gallery's thematic focus |
| location_description | text | | Description of gallery location |
| floor_plan_coordinate | jsonb | | Coordinates on museum floor plan |
| created_at | timestamp with time zone | DEFAULT now() | Record creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Record last update timestamp |

*Note: Combined UNIQUE constraint on (museum_id, name) ensures gallery names are unique within each museum.*

### objects

Stores information about museum objects/artifacts.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| object_id | bigint | PRIMARY KEY | Object identifier (often using museum's numbering system) |
| museum_id | integer | NOT NULL, FOREIGN KEY | Reference to parent museum |
| gallery_id | integer | FOREIGN KEY | Reference to containing gallery (optional) |
| object_number | text | | Museum's internal reference number |
| title | text | NOT NULL | Object title |
| artist_display_name | text | | Artist or creator name |
| culture | text | | Cultural origin of the object |
| period | text | | Historical period |
| object_date | text | | Creation date or period |
| medium | text | | Materials used |
| dimensions | text | | Physical dimensions |
| credit_line | text | | Credit or acquisition information |
| description | text | | Detailed description of the object |
| image_url | text | | URL to the object's primary image |
| tags | text[] | | Array of tags for categorization |
| created_at | timestamp with time zone | DEFAULT now() | Record creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Record last update timestamp |

### personas

Defines character personas used for guide content.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| persona_id | integer | PRIMARY KEY | Auto-incrementing unique identifier |
| name | text | NOT NULL, UNIQUE | Persona name |
| description | text | | Description of the persona's character |
| avatar_url | text | | URL to persona's avatar image |
| voice_model_identifier | text | | ElevenLabs voice model ID |
| voice_settings | jsonb | | Default voice settings for this persona |
| language_support | text[] | | Array of supported language codes |
| created_at | timestamp with time zone | DEFAULT now() | Record creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Record last update timestamp |

### guide_texts

Stores textual content for audio guides.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| guide_text_id | integer | PRIMARY KEY | Auto-incrementing unique identifier |
| persona_id | integer | NOT NULL, FOREIGN KEY | Reference to persona used |
| language | varchar(10) | NOT NULL | Language code (e.g., 'en', 'zh') |
| museum_id | integer | FOREIGN KEY | Associated museum (if applicable) |
| gallery_id | integer | FOREIGN KEY | Associated gallery (if applicable) |
| object_id | bigint | FOREIGN KEY | Associated object (if applicable) |
| transcript | text | NOT NULL | Guide text content |
| version | integer | NOT NULL DEFAULT 1 | Content version number |
| is_latest_version | boolean | NOT NULL DEFAULT true | Flag for latest version |
| is_active | boolean | NOT NULL DEFAULT true | Flag for active status |
| created_at | timestamp with time zone | DEFAULT now() | Record creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Record last update timestamp |

*Note: CHECK constraint ensures exactly one of museum_id, gallery_id, or object_id is non-NULL.*

### guide_audios

Stores audio versions of guide content.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| audio_guide_id | integer | PRIMARY KEY | Auto-incrementing unique identifier |
| guide_text_id | integer | FOREIGN KEY | Reference to guide text content |
| persona_id | integer | NOT NULL, FOREIGN KEY | Reference to persona used |
| language | varchar(10) | NOT NULL | Language code (e.g., 'en', 'zh') |
| museum_id | integer | FOREIGN KEY | Associated museum (if applicable) |
| gallery_id | integer | FOREIGN KEY | Associated gallery (if applicable) |
| object_id | bigint | FOREIGN KEY | Associated object (if applicable) |
| audio_url | text | NOT NULL | URL to audio file in storage |
| duration_seconds | integer | | Duration of audio in seconds |
| version | integer | NOT NULL DEFAULT 1 | Audio version number |
| is_latest_version | boolean | NOT NULL DEFAULT true | Flag for latest version |
| is_active | boolean | NOT NULL DEFAULT true | Flag for active status |
| generated_at | timestamp with time zone | DEFAULT now() | Audio generation timestamp |
| metadata | jsonb | | Audio generation metadata |
| created_at | timestamp with time zone | DEFAULT now() | Record creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Record last update timestamp |

*Note: CHECK constraint ensures exactly one of museum_id, gallery_id, or object_id is non-NULL.*

## Constraints and Indices

### Key Constraints

- **Primary Keys**: Each table has a single-column primary key
- **Foreign Keys**: Maintain referential integrity between related tables
- **Unique Constraints**:
  - `museums`: `name` column
  - `galleries`: Combined (`museum_id`, `name`) columns
  - `personas`: `name` column

### Check Constraints

- `guide_texts`: Ensures exactly one of `museum_id`, `gallery_id`, or `object_id` is non-NULL
- `guide_audios`: Ensures exactly one of `museum_id`, `gallery_id`, or `object_id` is non-NULL

### Indices

- Primary key indices for all tables
- Foreign key indices for efficient joins
- Additional indices on frequently queried columns:
  - `museums`: `name` (full text search)
  - `objects`: `tags` (GIN index for array searching)
  - `guide_texts`: `language` (for language filtering)
  - `guide_audios`: Combined index on (`is_latest_version`, `is_active`)

## Database Triggers

The database implements several automated triggers:

### Timestamp Updates

Automatic `updated_at` field updates for all tables when records are modified:

```sql
-- Example trigger for museums table
CREATE TRIGGER update_museums_updated_at
BEFORE UPDATE ON museums
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

### Latest Version Management

Triggers to manage `is_latest_version` flags when new versions are added:

```sql
-- For guide_texts
CREATE TRIGGER update_guide_text_latest_version_trigger
AFTER INSERT OR UPDATE ON guide_texts
FOR EACH ROW
EXECUTE FUNCTION update_latest_version();

-- For guide_audios
CREATE TRIGGER update_guide_audio_latest_version_trigger
AFTER INSERT OR UPDATE ON guide_audios
FOR EACH ROW
EXECUTE FUNCTION update_latest_version();
```

The `update_latest_version()` function:

```sql
CREATE OR REPLACE FUNCTION update_latest_version()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a new version being set as latest
    IF NEW.is_latest_version = true THEN
        -- Set all other versions of this content to not latest
        EXECUTE format('UPDATE %I SET is_latest_version = false 
                       WHERE %I = $1 
                       AND %I = $2 
                       AND %I = $3 
                       AND %I = $4
                       AND id != $5',
                       TG_TABLE_NAME,
                       TG_ARGV[0], -- entity type column (museum_id, gallery_id, or object_id)
                       'persona_id',
                       'language',
                       'version',
                       NEW.entity_id, -- The specific entity ID value
                       NEW.persona_id,
                       NEW.language,
                       NEW.version,
                       NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Schema Evolution

The database schema is designed to evolve with the application. When schema changes are needed:

1. Create migration scripts for both forward and rollback changes
2. Use transaction blocks to ensure atomicity of migrations
3. Test migrations on staging environment before production
4. Consider data migration needs when schema changes would affect existing data

## Performance Considerations

Several performance optimizations have been implemented:

1. **Appropriate Indices**: On most frequently queried columns and combinations
2. **Denormalization**: Where beneficial for read performance
3. **JSONB for Flexibility**: Used for structured data that may vary (e.g., opening_hours, metadata)
4. **Array Types**: Used for tags and other list data to support efficient searches
5. **Partitioning Strategy**: For tables expected to grow very large (e.g., guide_audios)

Performance monitoring and query tuning are ongoing processes, with regular reviews of slow queries identified through database monitoring tools.
