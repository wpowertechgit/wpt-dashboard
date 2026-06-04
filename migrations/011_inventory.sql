-- Inventory management: categories, items, transactions

CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('raw_material','finished_good')),
  unit        TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  sku               TEXT UNIQUE,
  type              TEXT NOT NULL CHECK (type IN ('raw_material','finished_good')),
  unit              TEXT NOT NULL,
  quantity_on_hand  NUMERIC(12,3) NOT NULL DEFAULT 0,
  quantity_reserved NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock_level   NUMERIC(12,3),
  cost_per_unit     NUMERIC(14,2),
  supplier          TEXT,
  location          TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('in','out','adjustment','reservation')),
  quantity     NUMERIC(12,3) NOT NULL,
  reference    TEXT,
  notes        TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger for items
CREATE OR REPLACE TRIGGER set_updated_at_inventory_items
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Automatically adjust quantity_on_hand on transaction insert
CREATE OR REPLACE FUNCTION public.apply_inventory_transaction()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.type = 'in' THEN
    UPDATE public.inventory_items SET quantity_on_hand = quantity_on_hand + NEW.quantity WHERE id = NEW.item_id;
  ELSIF NEW.type = 'out' THEN
    UPDATE public.inventory_items SET quantity_on_hand = quantity_on_hand - NEW.quantity WHERE id = NEW.item_id;
  ELSIF NEW.type = 'adjustment' THEN
    UPDATE public.inventory_items SET quantity_on_hand = NEW.quantity WHERE id = NEW.item_id;
  ELSIF NEW.type = 'reservation' THEN
    UPDATE public.inventory_items SET quantity_reserved = quantity_reserved + NEW.quantity WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER after_inventory_transaction
  AFTER INSERT ON public.inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION public.apply_inventory_transaction();

-- Indexes
CREATE INDEX IF NOT EXISTS inventory_items_category_idx    ON public.inventory_items(category_id);
CREATE INDEX IF NOT EXISTS inventory_items_type_idx        ON public.inventory_items(type);
CREATE INDEX IF NOT EXISTS inventory_transactions_item_idx ON public.inventory_transactions(item_id);

-- RLS
ALTER TABLE public.inventory_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Categories
CREATE POLICY inv_categories_read ON public.inventory_categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inv_categories_write ON public.inventory_categories
  FOR ALL TO authenticated
  USING (private.can_write_office() OR private.is_admin())
  WITH CHECK (private.can_write_office() OR private.is_admin());

-- Items
CREATE POLICY inv_items_read ON public.inventory_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inv_items_write ON public.inventory_items
  FOR ALL TO authenticated
  USING (private.can_write_office() OR private.is_admin())
  WITH CHECK (private.can_write_office() OR private.is_admin());

-- Transactions
CREATE POLICY inv_tx_read ON public.inventory_transactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY inv_tx_insert ON public.inventory_transactions
  FOR INSERT TO authenticated
  WITH CHECK (private.can_write_office() OR private.is_admin());
CREATE POLICY inv_tx_delete ON public.inventory_transactions
  FOR DELETE TO authenticated
  USING (private.is_admin());
