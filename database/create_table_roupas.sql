create table roupas (
  id serial primary key, 
  nome varchar(255) not null,
  cor varchar(255) not null,
  tamanho varchar(255) not null,
  preco numeric not null,
  quantidade integer not null,
  img text not null
)

