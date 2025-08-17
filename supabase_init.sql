
-- Employees
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  daily_rate numeric default 0,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Timesheets
create table if not exists timesheets (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade,
  date date not null,
  check_in timestamptz,
  check_out timestamptz,
  notes text,
  inserted_at timestamptz default now(),
  unique(employee_id, date)
);

-- Withdrawals
create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade,
  date date not null default now(),
  amount numeric not null,
  note text,
  created_at timestamptz default now()
);

-- Expenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  description text,
  amount numeric not null,
  created_at timestamptz default now()
);

-- Debts
create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  client_name text not null,
  amount numeric not null,
  paid numeric default 0,
  created_at timestamptz default now()
);

-- Simple sales (optional for dashboard)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  total numeric not null default 0,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  qty int not null default 1,
  price numeric not null,
  created_at timestamptz default now()
);
