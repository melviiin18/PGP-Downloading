-- Table: configuration.transactions

-- DROP TABLE configuration.transactions;

CREATE TABLE configuration.transactions
(
  date_requested date,
  expiration_date date,
  passcode character(6) NOT NULL,
  contact_person character(100),
  agency character(50),
  layers text,
  CONSTRAINT prim_key PRIMARY KEY (passcode)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE configuration.transactions
  OWNER TO geoportal;
