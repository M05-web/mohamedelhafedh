-- USERS PROFILE TABLE
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    email text, -- Added missing email column
    phone text,
    role text check (role in ('patient','doctor','admin')),
    created_at timestamp default now()
);

-- SPECIALTIES
create table specialties (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text
);

-- PATIENTS
create table patients (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id) on delete cascade,
    date_of_birth date,
    gender text,
    address text,
    blood_group text,
    allergies text,
    chronic_diseases text,
    emergency_contact text
);

-- DOCTORS
create table doctors (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id) on delete cascade,
    specialty_id uuid references specialties(id),
    hospital text,
    experience_years int,
    consultation_fee numeric,
    biography text
);

-- DOCTOR SCHEDULE
create table schedules (
    id uuid primary key default uuid_generate_v4(),
    doctor_id uuid references doctors(id) on delete cascade,
    day_of_week int,
    start_time time,
    end_time time
);

-- APPOINTMENTS
create table appointments (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id),
    doctor_id uuid references doctors(id),
    appointment_date date,
    appointment_time time,
    reason text,
    status text check (status in ('pending','confirmed','cancelled','completed')) default 'pending',
    created_at timestamp default now()
);

-- MEDICAL RECORDS
create table medical_records (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id),
    doctor_id uuid references doctors(id),
    diagnosis text,
    treatment text,
    notes text,
    created_at timestamp default now()
);

-- PRESCRIPTIONS
create table prescriptions (
    id uuid primary key default uuid_generate_v4(),
    medical_record_id uuid references medical_records(id) on delete cascade,
    medication text,
    dosage text,
    instructions text
);

-- DOCUMENTS
create table documents (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id),
    doctor_id uuid references doctors(id),
    file_url text,
    document_type text,
    uploaded_at timestamp default now()
);

-- MESSAGES (chat)
create table messages (
    id uuid primary key default uuid_generate_v4(),
    sender_id uuid references profiles(id),
    receiver_id uuid references profiles(id),
    message text,
    created_at timestamp default now()
);

-- NOTIFICATIONS
create table notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id),
    message text,
    is_read boolean default false,
    created_at timestamp default now()
);

-- REVIEWS
create table reviews (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id),
    doctor_id uuid references doctors(id),
    rating int check (rating >=1 and rating <=5),
    comment text,
    created_at timestamp default now()
);

-- AUDIT LOGS
create table audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id),
    action text,
    ip_address text,
    created_at timestamp default now()
);