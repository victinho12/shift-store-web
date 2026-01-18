create table categoria(
  id SERIAL primary key,
  nome text not null 
)
insert into public.categoria (nome) values ('Masculino'),('Femenino'),('Unisex');
select * from public.categoria 