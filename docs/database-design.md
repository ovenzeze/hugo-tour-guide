## 1. 引言与目标
本文档定义了"博物馆 AI 导游"项目后端所需的数据库结构。其主要目标是：
- 存储和管理博物馆、展区、展品的层级信息。
- 管理 AI 导游角色（Persona）及其对应的多语言语音导览内容。
- 支持语音库的"被动更新"机制。
- 为前端应用提供高效、可靠的数据查询接口。
- 确保数据模型的清晰性、可维护性和可扩展性。

## 2. 指导性原则
在设计和后续维护数据库时，应遵循以下原则：
- **明确层级，关系清晰** (Clear Hierarchy & Relationships): 严格区分博物馆、展区、展品三个核心实体层级，并通过外键明确它们之间的关系。实体信息与导览内容（角色、语音）分离。
- **适度规范化** (Appropriate Normalization): 在减少数据冗余和提高一致性（如使用 Museums, Galleries, Personas 独立表）与保持查询效率（如 Objects 表仍可包含部分常用但可能冗余的信息）之间取得平衡。避免过度规范化导致查询过于复杂。
- **数据完整性优先** (Data Integrity First): 广泛使用主键（PK）、外键（FK）、非空（NOT NULL）、唯一（UNIQUE）和检查（CHECK）约束来保证数据的准确性和一致性。
- **支持核心功能** (Support Core Features): 设计必须直接支持 AI 导游的核心功能，包括按层级获取信息、按角色和语言获取语音、版本管理等。
- **考虑查询性能** (Consider Query Performance): 为常见的查询模式（如按实体 ID、角色、语言查找最新语音）设计合适的索引。特别关注 AudioGuides 表的查询效率。
- **拥抱扩展性** (Embrace Extensibility): 设计应允许未来方便地添加新功能，如更多角色、语言、实体类型（如特定主题展览）、用户交互数据等。使用 JSONB 等灵活类型存储非结构化或易变元数据。
- **命名一致性** (Consistent Naming): 采用统一的命名规范（例如：表名复数、列名 snake_case、主键 entity_id、外键 related_entity_id）。
- **数据类型精确化** (Precise Data Types): 尽可能使用最合适的数据类型（如 BOOLEAN 代替 TEXT 表示标志，INTEGER 或 DATE 代替 TEXT 表示年份/日期，TIMESTAMPTZ 存储时间戳）。

## 3. 实体关系概述
- 一个 Museum 可以包含多个 Galleries 和多个 Objects。
- 一个 Gallery 属于一个 Museum，并且可以包含多个 Objects。
- 一个 Object 属于一个 Museum，通常也属于一个 Gallery。
- 一个 Persona (AI 角色) 可以有多条 AudioGuides (语音记录)。
- 一条 AudioGuide 属于一个 Persona，并且关联到一个具体的 Museum、Gallery 或 Object 实体。

## 4. 数据库 Schema
> 使用 PostgreSQL 数据库，利用其特性如 SERIAL, TEXT[], JSONB, TIMESTAMPTZ

### 4.1 Museums表（博物馆）

```sql
-- 博物馆表：存储博物馆的基本信息
CREATE TABLE museums (
    museum_id SERIAL PRIMARY KEY,                        -- 博物馆唯一标识
    name TEXT NOT NULL UNIQUE,                           -- 博物馆名称
    description TEXT,                                    -- 博物馆整体介绍
    address TEXT,                                        -- 地址
    city TEXT,
    country TEXT,
    website TEXT,                                        -- 官方网站 URL
    opening_hours JSONB,                                 -- 开放时间 (结构灵活, e.g., {"weekday": "9:00-17:00", "weekend": "10:00-18:00"})
    logo_url TEXT,                                       -- Logo 图片 URL
    cover_image_url TEXT,                                -- 封面图 URL
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,    -- 创建时间
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP     -- 最后更新时间
);

-- 博物馆表索引
CREATE INDEX idx_museums_name ON museums (name);
CREATE INDEX idx_museums_country_city ON museums (country, city); -- 用于地理位置筛选
```

### 4.2 Galleries表（展区）

```sql
-- 展区表：存储博物馆内的展区或展厅信息
CREATE TABLE galleries (
    gallery_id SERIAL PRIMARY KEY,                       -- 展区唯一标识
    museum_id INTEGER NOT NULL REFERENCES museums(museum_id) ON DELETE CASCADE, -- 所属博物馆
    gallery_number TEXT,                                 -- 展厅编号 (博物馆内部使用，可选)
    name TEXT NOT NULL,                                  -- 展区名称
    description TEXT,                                    -- 展区介绍
    theme TEXT,                                          -- 展区主题
    location_description TEXT,                           -- 位置描述 (e.g., "二楼东翼")
    floor_plan_coordinate JSONB,                         -- (可选) 在楼层平面图上的位置信息 (e.g., {"x": 100, "y": 250, "floor": 2})
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,    -- 创建时间
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,    -- 最后更新时间
    
    -- 约束：同一博物馆内展区名称唯一
    UNIQUE (museum_id, name),
    -- 约束：同一博物馆内展厅编号唯一（如果gallery_number被严格使用）
    UNIQUE (museum_id, gallery_number)
);

-- 展区表索引
CREATE INDEX idx_galleries_museum_id ON galleries (museum_id);
CREATE INDEX idx_galleries_museum_id_name ON galleries (museum_id, name);
```

### 4.3 Objects表（展品）

```sql
-- 展品表：存储展品的详细信息 (基于原 metv0.2 改进)
CREATE TABLE objects (
    object_id BIGINT PRIMARY KEY,                        -- 展品唯一标识 (沿用原 ID)
    museum_id INTEGER NOT NULL REFERENCES museums(museum_id) ON DELETE RESTRICT, -- 所属博物馆
    gallery_id INTEGER NULL REFERENCES galleries(gallery_id) ON DELETE SET NULL, -- 所属展区
    object_number TEXT,                                  -- 博物馆内部编号
    title TEXT NOT NULL,                                 -- 标题
    object_name TEXT,                                    -- 通用名称/类别
    artist_display_name TEXT,                            -- 艺术家名称
    culture TEXT,
    period TEXT,
    object_date TEXT,                                    -- 创作日期描述
    medium TEXT,                                         -- 材质
    dimensions TEXT,                                     -- 尺寸
    description TEXT,                                    -- 详细描述
    image_url TEXT,                                      -- 主要图片 URL
    credit_line TEXT,                                    -- 来源说明
    department TEXT,                                     -- 所属部门
    classification TEXT,                                 -- 展品的主要类型分类 (e.g., "Painting", "Sculpture", "Ceramics")
    is_highlight BOOLEAN DEFAULT FALSE,                  -- 是否亮点
    is_public_domain BOOLEAN DEFAULT FALSE,              -- 是否公共领域
    tags TEXT[],                                         -- (可选) 标签数组
    link_resource TEXT,                                  -- 官网链接
    object_wikidata_url TEXT,                            -- Wikidata 链接
    metadata_date DATE,                                  -- 元数据日期
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,    -- 记录创建时间
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP     -- 记录最后更新时间
);

-- 展品表索引
CREATE INDEX idx_objects_museum_id ON objects (museum_id);
CREATE INDEX idx_objects_gallery_id ON objects (gallery_id);
CREATE INDEX idx_objects_title ON objects USING gin(to_tsvector('simple', title));
CREATE INDEX idx_objects_artist ON objects (artist_display_name);
CREATE INDEX idx_objects_culture ON objects (culture);
CREATE INDEX idx_objects_tags ON objects USING GIN (tags);
CREATE INDEX idx_objects_classification ON objects (classification); -- 按展品类型分类进行筛选
CREATE INDEX idx_objects_period ON objects (period); -- 按时期进行筛选
```

> **关于展品表的说明:**
> 1. 需要仔细审核原 metv0.2 的所有列，决定哪些需要保留、合并或废弃。
> 2. 考虑将 object_begin_date, object_end_date, accession_year 等改为 INTEGER 类型。
> 3. 艺术家、文化、时期等可以考虑未来进一步规范化到独立表。
> 4. 分类策略: 优先使用 classification 字段进行核心分类。department 提供更高层级的组织结构。
>    tags 可用于更灵活、多维度的补充标记。

### 4.4 Personas表（AI导游角色）

```sql
-- AI导游角色表：定义AI导游角色
CREATE TABLE personas (
    persona_id SERIAL PRIMARY KEY,                       -- AI 角色唯一标识
    name TEXT NOT NULL UNIQUE,                           -- 角色名称
    description TEXT,                                    -- 角色描述
    avatar_url TEXT,                                     -- 头像图片 URL
    voice_description TEXT,                              -- 声音特点描述
    voice_model_identifier TEXT,                         -- (可选) TTS 模型标识
    language_support TEXT[],                             -- (可选) 支持的语言代码列表
    is_active BOOLEAN DEFAULT TRUE,                      -- 是否可用
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,    -- 创建时间
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP     -- 最后更新时间
);

-- AI导游角色表索引
CREATE INDEX idx_personas_name ON personas (name);
CREATE INDEX idx_personas_is_active ON personas (is_active); -- 快速筛选活跃角色
```

### 4.5 Audio_guides表（语音导览）

```sql
-- 语音导览表：存储具体的语音导览信息，关联角色和实体
CREATE TABLE audio_guides (
    audio_guide_id SERIAL PRIMARY KEY,                   -- 语音导览唯一标识
    persona_id INTEGER NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE, -- 关联的 AI 角色
    language VARCHAR(10) NOT NULL,                       -- 语言代码
    museum_id INTEGER NULL REFERENCES museums(museum_id) ON DELETE CASCADE, -- 关联的博物馆
    gallery_id INTEGER NULL REFERENCES galleries(gallery_id) ON DELETE CASCADE, -- 关联的展区
    object_id BIGINT NULL REFERENCES objects(object_id) ON DELETE CASCADE, -- 关联的展品
    audio_url TEXT NOT NULL,                             -- 语音文件 URL 或路径
    duration_seconds INTEGER,                            -- (可选) 语音时长（秒）
    transcript TEXT,                                     -- (可选) 语音文本内容
    version INTEGER DEFAULT 1,                           -- 语音版本号
    is_latest_version BOOLEAN DEFAULT TRUE,              -- 是否为最新版本
    is_active BOOLEAN DEFAULT TRUE,                      -- 是否可用
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,  -- 生成或入库时间
    metadata JSONB,                                      -- (可选) 其他元数据
    
    -- 约束：确保只关联一个实体（博物馆、展区或展品）
    CHECK ((museum_id IS NOT NULL)::int + (gallery_id IS NOT NULL)::int + (object_id IS NOT NULL)::int = 1)
);
```

### 4.6 Audio_guides表索引

```sql
-- 语音导览表索引和唯一性约束
-- 最新版本索引（用于快速查找最新、活跃的语音导览）
CREATE INDEX idx_audio_guides_lookup_museum ON audio_guides (persona_id, language, museum_id, is_latest_version, is_active) 
    WHERE museum_id IS NOT NULL;
CREATE INDEX idx_audio_guides_lookup_gallery ON audio_guides (persona_id, language, gallery_id, is_latest_version, is_active) 
    WHERE gallery_id IS NOT NULL;
CREATE INDEX idx_audio_guides_lookup_object ON audio_guides (persona_id, language, object_id, is_latest_version, is_active) 
    WHERE object_id IS NOT NULL;

-- 更新操作索引（用于优化特定实体语音的更新操作）
CREATE INDEX idx_audio_guides_update_museum ON audio_guides (museum_id, persona_id, language) 
    WHERE museum_id IS NOT NULL;
CREATE INDEX idx_audio_guides_update_gallery ON audio_guides (gallery_id, persona_id, language) 
    WHERE gallery_id IS NOT NULL;
CREATE INDEX idx_audio_guides_update_object ON audio_guides (object_id, persona_id, language) 
    WHERE object_id IS NOT NULL;

-- 唯一性索引（确保每个实体、角色、语言组合只有一个特定版本）
CREATE UNIQUE INDEX unique_museum_version ON audio_guides (persona_id, language, museum_id, version) 
    WHERE museum_id IS NOT NULL;
CREATE UNIQUE INDEX unique_gallery_version ON audio_guides (persona_id, language, gallery_id, version) 
    WHERE gallery_id IS NOT NULL;
CREATE UNIQUE INDEX unique_object_version ON audio_guides (persona_id, language, object_id, version) 
    WHERE object_id IS NOT NULL;
```

## 5. 关系说明

### 5.1 Museums表关系
- 无外键依赖
- 被以下表引用:
  - galleries.museum_id -> museums.museum_id (Many-to-One)
  - objects.museum_id -> museums.museum_id (Many-to-One)
  - audio_guides.museum_id -> museums.museum_id (Many-to-One, Conditional)

### 5.2 Galleries表关系
- 外键依赖:
  - galleries.museum_id -> museums.museum_id (Many-to-One)
- 被以下表引用:
  - objects.gallery_id -> galleries.gallery_id (Many-to-One, Nullable)
  - audio_guides.gallery_id -> galleries.gallery_id (Many-to-One, Conditional)

### 5.3 Objects表关系
- 外键依赖:
  - objects.museum_id -> museums.museum_id (Many-to-One)
  - objects.gallery_id -> galleries.gallery_id (Many-to-One, Nullable)
- 被以下表引用:
  - audio_guides.object_id -> objects.object_id (Many-to-One, Conditional)

### 5.4 Personas表关系
- 无外键依赖
- 被以下表引用:
  - audio_guides.persona_id -> personas.persona_id (Many-to-One)

### 5.5 Audio_guides表关系
- 外键依赖:
  - audio_guides.persona_id -> personas.persona_id (Many-to-One)
  - audio_guides.museum_id -> museums.museum_id (Many-to-One, Conditional)
  - audio_guides.gallery_id -> galleries.gallery_id (Many-to-One, Conditional)
  - audio_guides.object_id -> objects.object_id (Many-to-One, Conditional)
- 备注: audio_guides表只关联一个实体（博物馆、展区或展品），由CHECK约束确保

## 6. 假设与未来考虑
- **数据库系统:** 假定使用 PostgreSQL，以便利用其特定功能。
- **主键策略:** 主要使用 SERIAL，objects 表沿用现有 BIGINT。可考虑 UUID 以便于分布式系统或数据合并。
- **objects 表细节:** 需要基于 metv0.2 的实际数据和业务需求，仔细确定最终保留的列、数据类型和约束。
- **进一步规范化:** 艺术家、文化、时期、部门、分类等信息，如果查询和管理需求复杂，未来可以抽取到独立的表中。
- **文本多语言:** 当前设计主要关注语音多语言。如果博物馆、展区、展品的文本描述也需要多语言，需要在 museums, galleries, objects 表中设计相应方案。
- **语音文件存储:** audio_url 假定指向外部存储（如 S3, OSS 或 CDN）。
- **索引优化:** 当前索引是基于通用场景的建议，需要根据实际部署后的查询分析进行调优。

## 7. 数据库触发器
以下触发器用于自动化数据维护和确保一致性:

### 7.1 更新时间戳触发器

```sql
-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- 为每个表创建触发器
CREATE TRIGGER update_museums_updated_at
BEFORE UPDATE ON museums
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 同样的触发器应用于其他表
CREATE TRIGGER update_galleries_updated_at
BEFORE UPDATE ON galleries
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_objects_updated_at
BEFORE UPDATE ON objects
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_personas_updated_at
BEFORE UPDATE ON personas
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_audio_guides_updated_at
BEFORE UPDATE ON audio_guides
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

### 7.2 语音导览版本管理触发器

```sql
-- 语音导览版本管理触发器函数
CREATE OR REPLACE FUNCTION update_audio_guide_latest_version()
RETURNS TRIGGER AS $function$
BEGIN
    -- 当插入新的语音导览时，将同一实体、同一角色、同一语言的其他记录标记为非最新版本
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_latest_version = TRUE THEN
        IF NEW.museum_id IS NOT NULL THEN
            UPDATE audio_guides
            SET is_latest_version = FALSE
            WHERE persona_id = NEW.persona_id
                AND language = NEW.language
                AND museum_id = NEW.museum_id
                AND audio_guide_id <> NEW.audio_guide_id;
        ELSIF NEW.gallery_id IS NOT NULL THEN
            UPDATE audio_guides
            SET is_latest_version = FALSE
            WHERE persona_id = NEW.persona_id
                AND language = NEW.language
                AND gallery_id = NEW.gallery_id
                AND audio_guide_id <> NEW.audio_guide_id;
        ELSIF NEW.object_id IS NOT NULL THEN
            UPDATE audio_guides
            SET is_latest_version = FALSE
            WHERE persona_id = NEW.persona_id
                AND language = NEW.language
                AND object_id = NEW.object_id
                AND audio_guide_id <> NEW.audio_guide_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- 创建语音导览版本管理触发器
CREATE TRIGGER update_audio_guide_latest_version_trigger
BEFORE INSERT OR UPDATE ON audio_guides
FOR EACH ROW
EXECUTE FUNCTION update_audio_guide_latest_version();
```
