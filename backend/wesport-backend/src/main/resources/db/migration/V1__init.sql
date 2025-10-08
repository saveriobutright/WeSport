create table app_user (
                          id uuid primary key,
                          keycloak_id varchar(255) not null unique,
                          display_name varchar(255) not null,
                          email varchar(255) not null unique
);

create table sport (
                       id bigserial primary key,
                       name varchar(100) not null unique
);

create table location (
                          id bigserial primary key,
                          name varchar(255) not null,
                          address varchar(255) not null,
                          lat double precision,
                          lng double precision
);

create table event (
                       id bigserial primary key,
                       sport_id bigint not null references sport(id),
                       location_id bigint not null references location(id),
                       start_at timestamptz not null,
                       max_participants integer not null,
                       total_cost numeric(10,2) not null,
                       status varchar(20) not null,
                       organizer_id uuid not null references app_user(id)
);

create table event_participant (
                                   id uuid primary key,
                                   event_id bigint not null references event(id),
                                   user_id uuid not null references app_user(id),
                                   role_name varchar(100) not null,
                                   paid boolean not null,
                                   constraint uq_event_user unique (event_id, user_id)
);

create table payment (
                         id uuid primary key,
                         event_id bigint not null references event(id),
                         user_id uuid not null references app_user(id),
                         amount numeric(10,2) not null,
                         status varchar(20) not null,
                         created_at timestamptz not null
);

-- Dati iniziali
insert into sport(name) values ('Calcio a 5'), ('Basket'), ('Paddle');

insert into location(name, address, lat, lng) values
    ('Arena Centro', 'Via Roma 10, Torino', 45.0703, 7.6869);
