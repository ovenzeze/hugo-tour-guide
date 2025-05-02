-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器 - 博物馆表
CREATE TRIGGER update_museums_updated_at
BEFORE UPDATE ON museums
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 创建触发器 - 展区表
CREATE TRIGGER update_galleries_updated_at
BEFORE UPDATE ON galleries
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 创建触发器 - 展品表
CREATE TRIGGER update_objects_updated_at
BEFORE UPDATE ON objects
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 创建触发器 - AI角色表
CREATE TRIGGER update_personas_updated_at
BEFORE UPDATE ON personas
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 创建触发器 - 语音导览表
CREATE TRIGGER update_guide_audios_updated_at
BEFORE UPDATE ON guide_audios
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 添加自动更新 guide_audios 最新版本标记的函数
CREATE OR REPLACE FUNCTION update_audio_guide_latest_version()
RETURNS TRIGGER AS $$
BEGIN
    -- 当插入新的语音导览时，将同一实体、同一角色、同一语言的其他记录标记为非最新版本
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_latest_version = TRUE THEN
        IF NEW.museum_id IS NOT NULL THEN
            UPDATE guide_audios
            SET is_latest_version = FALSE
            WHERE persona_id = NEW.persona_id
                AND language = NEW.language
                AND museum_id = NEW.museum_id
                AND audio_guide_id <> NEW.audio_guide_id;
        ELSIF NEW.gallery_id IS NOT NULL THEN
            UPDATE guide_audios
            SET is_latest_version = FALSE
            WHERE persona_id = NEW.persona_id
                AND language = NEW.language
                AND gallery_id = NEW.gallery_id
                AND audio_guide_id <> NEW.audio_guide_id;
        ELSIF NEW.object_id IS NOT NULL THEN
            UPDATE guide_audios
            SET is_latest_version = FALSE
            WHERE persona_id = NEW.persona_id
                AND language = NEW.language
                AND object_id = NEW.object_id
                AND audio_guide_id <> NEW.audio_guide_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器 - 自动管理语音导览最新版本
CREATE TRIGGER update_audio_guide_latest_version_trigger
BEFORE INSERT OR UPDATE ON guide_audios
FOR EACH ROW
EXECUTE FUNCTION update_audio_guide_latest_version(); 