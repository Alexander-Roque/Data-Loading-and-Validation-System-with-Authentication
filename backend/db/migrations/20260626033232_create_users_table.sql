-- migrate:up
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INTEGER CHECK (age > 0),
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- migrate:down
DROP TABLE IF EXISTS users;

