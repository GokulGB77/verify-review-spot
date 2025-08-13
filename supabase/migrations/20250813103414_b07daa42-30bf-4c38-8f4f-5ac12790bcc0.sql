-- 1) Create enum for verification status
DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2) Create table for verification requests
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  client_user_id UUID NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  service_name TEXT,
  service_date DATE,
  status verification_status NOT NULL DEFAULT 'pending',
  token_hash TEXT NOT NULL,
  token_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  review_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_active_request UNIQUE (entity_id, client_user_id, status),
  CONSTRAINT chk_contact CHECK (contact_email IS NOT NULL OR contact_phone IS NOT NULL)
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_verreq_entity ON public.verification_requests(entity_id);
CREATE INDEX IF NOT EXISTS idx_verreq_client ON public.verification_requests(client_user_id);
CREATE INDEX IF NOT EXISTS idx_verreq_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verreq_expires ON public.verification_requests(expires_at);

-- 4) Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- 5) Helper function to check entity admin role
-- Already have has_role(check_role app_role, check_entity_id uuid) in project

-- 6) RLS Policies
-- Entity admins can manage requests for their entity
CREATE POLICY IF NOT EXISTS "Entity admins manage verification requests" ON public.verification_requests
FOR ALL TO authenticated
USING (has_role('entity_admin', entity_id) OR has_role('super_admin'))
WITH CHECK (has_role('entity_admin', entity_id) OR has_role('super_admin'));

-- Clients can view their own requests
CREATE POLICY IF NOT EXISTS "Clients can view their own verification requests" ON public.verification_requests
FOR SELECT TO authenticated
USING (auth.uid() = client_user_id);

-- Clients can update their own request to accept/decline via app
CREATE POLICY IF NOT EXISTS "Clients can update own request status" ON public.verification_requests
FOR UPDATE TO authenticated
USING (auth.uid() = client_user_id)
WITH CHECK (auth.uid() = client_user_id);

-- 7) Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_verification_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_verification_requests_updated_at ON public.verification_requests;
CREATE TRIGGER trg_update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW EXECUTE FUNCTION public.update_verification_requests_updated_at();

-- 8) Expire pending records automatically on update attempts
CREATE OR REPLACE FUNCTION public.set_verification_expired_if_needed()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'pending' AND NEW.expires_at < now()) THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_expire_verification_requests ON public.verification_requests;
CREATE TRIGGER trg_expire_verification_requests
BEFORE INSERT OR UPDATE ON public.verification_requests
FOR EACH ROW EXECUTE FUNCTION public.set_verification_expired_if_needed();

-- 9) Notifications
CREATE OR REPLACE FUNCTION public.notify_verification_request_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Create in-app notification for client
  INSERT INTO public.notifications (user_id, type, title, message, related_entity_id)
  VALUES (
    NEW.client_user_id,
    'verification_request',
    'Verification Request',
    'A business requested to verify you as a client',
    NEW.entity_id
  );
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_verification_request_created ON public.verification_requests;
CREATE TRIGGER trg_notify_verification_request_created
AFTER INSERT ON public.verification_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_verification_request_created();

CREATE OR REPLACE FUNCTION public.notify_verification_request_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Notify client on status change
    INSERT INTO public.notifications (user_id, type, title, message, related_entity_id)
    VALUES (
      NEW.client_user_id,
      'verification_status',
      'Verification Status Updated',
      'Your verification request status changed to ' || NEW.status::text,
      NEW.entity_id
    );
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_verification_request_updated ON public.verification_requests;
CREATE TRIGGER trg_notify_verification_request_updated
AFTER UPDATE ON public.verification_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_verification_request_updated();

-- 10) When a verified request exists and a new review is created for same user+entity, mark review as Verified Client
CREATE OR REPLACE FUNCTION public.mark_review_verified_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act on INSERT of a base review (not updates)
  IF TG_OP = 'INSERT' THEN
    -- Check for accepted verification within the last 30 days (or any time)
    IF EXISTS (
      SELECT 1 FROM public.verification_requests vr
      WHERE vr.entity_id = NEW.business_id
        AND vr.client_user_id = NEW.user_id
        AND vr.status = 'accepted'
    ) THEN
      NEW.is_verified := true;
      NEW.custom_verification_tag := 'Verified Client';
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mark_review_verified_client ON public.reviews;
CREATE TRIGGER trg_mark_review_verified_client
BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.mark_review_verified_client();

-- 11) Prevent duplicate multiple reviews by same user for same entity (base reviews only)
DO $$ BEGIN
  ALTER TABLE public.reviews ADD CONSTRAINT one_base_review_per_user_entity
  UNIQUE (user_id, business_id)
  DEFERRABLE INITIALLY DEFERRED;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 12) Ensure only verified entities can create requests at DB level
-- This is enforced via RLS USING has_role('entity_admin', entity_id). To enforce entity verification, create a function.
CREATE OR REPLACE FUNCTION public.entity_is_verified(e_id uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT COALESCE((SELECT is_verified FROM public.entities WHERE entity_id = e_id), false);
$$;

-- Add a WITH CHECK policy addition using entity_is_verified
DROP POLICY IF EXISTS "Entity admins manage verification requests" ON public.verification_requests;
CREATE POLICY "Entity admins manage verification requests" ON public.verification_requests
FOR ALL TO authenticated
USING ((has_role('entity_admin', entity_id) OR has_role('super_admin')))
WITH CHECK ((has_role('entity_admin', entity_id) OR has_role('super_admin')) AND entity_is_verified(entity_id));
