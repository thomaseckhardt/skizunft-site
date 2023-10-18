CREATE TABLE
  booking (
    booking_id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
    first_name varchar(50) NOT NULL,
    last_name varchar(50) NOT NULL,
    street varchar(100) NOT NULL,
    postal_code varchar(20) NOT NULL,
    city varchar(50) NOT NULL,
    country varchar(50) NOT NULL,
    email varchar(100) NOT NULL,
    phone varchar(20) NOT NULL,
    created_at timestamp
    with
      time zone DEFAULT now ()
  );

CREATE TABLE
  attendee (
    attendee_id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
    first_name varchar(50) NOT NULL,
    last_name varchar(50) NOT NULL,
    age int NOT NULL,
    member boolean NOT NULL,
    booking_id uuid REFERENCES booking (booking_id) NOT NULL,
    created_at timestamp
    with
      time zone DEFAULT now ()
  );

ALTER TABLE booking ENABLE ROW LEVEL SECURITY;

CREATE POLICY insert_booking_policy ON booking FOR INSERT TO PUBLIC USING (true);

ALTER TABLE attendee ENABLE ROW LEVEL SECURITY;

CREATE POLICY insert_attendee_policy ON attendee FOR INSERT TO PUBLIC USING (true);

CREATE OR REPLACE FUNCTION public.insert_books(
  title text,
  user_id uuid
)
RETURNS setof public.books
AS $$
  declare
  book_id uuid;
begin
  INSERT into books 
    (title) 
    values (title) 
    returning id 
    into book_id;
  INSERT into book_users 
    (book_id, user_id)
     values (book_id, user_id);
RETURN query select * from boards where boards.id = board_id;
END $$ language plpgsql;