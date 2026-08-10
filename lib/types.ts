export type Business = {
  id: string;
  name: string;
  category: string;
  stage: string;
  city: string;
  currency: string;
  budget: number;
  launch_date: string | null;
  created_at: string;
};

export type SetupItem = {
  id: string;
  business_id: string;
  module: string;
  name: string;
  status: string;
  estimated_cost: number;
  committed_cost: number;
  paid_amount: number;
  due_date: string | null;
  source: string;
};

export type BusinessTask = {
  id: string;
  business_id: string;
  title: string;
  module: string;
  status: string;
  priority: string;
  due_date: string | null;
};

export type Vendor = {
  id: string;
  business_id: string;
  name: string;
  category: string;
  contact_name: string;
  phone: string;
  email: string;
};

export type BusinessModule = {
  id: string;
  business_id: string;
  module_key: string;
  sort_order: number;
};
