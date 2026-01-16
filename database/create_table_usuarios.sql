CREATE TABLE usuarios (
  id SERIAL primary key,
  nome text not null,
  email text not null,
  senha text not null,
  criado_em timestamp default current_timestamp
);