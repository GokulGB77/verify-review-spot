-- Add slug field to entities table for custom links
ALTER TABLE public.entities 
ADD COLUMN slug TEXT UNIQUE;

-- Create index on slug for better performance
CREATE INDEX idx_entities_slug ON public.entities(slug);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert name to lowercase, replace spaces and special chars with hyphens
    base_slug := lower(regexp_replace(trim(name), '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    -- Ensure slug is not empty
    IF base_slug = '' THEN
        base_slug := 'entity';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.entities WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing entities with slugs based on their names
UPDATE public.entities 
SET slug = generate_slug(name) 
WHERE slug IS NULL AND name IS NOT NULL;

-- Trigger to auto-generate slug for new entities
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL AND NEW.name IS NOT NULL THEN
        NEW.slug := generate_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_slug
    BEFORE INSERT OR UPDATE OF name ON public.entities
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();