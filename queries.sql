--# PostgreSQL Queries
-- Run these queries to initialize and configure the database

CREATE SCHEMA auth;

CREATE TABLE auth.tb_users (
	id SERIAL8 PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	password varchar(255) NOT NULL,
	email_confirmed BOOLEAN DEFAULT FALSE,
	email_token UUID,
	password_reset_token varchar(255),
	password_reset_provisional varchar(255),
	password_reset_expiry TIMESTAMP, 
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- drop table auth.tb_users_tokens
CREATE TABLE auth.tb_users_tokens (
	id SERIAL PRIMARY KEY,
	user_id int8 NOT NULL, -- REFERENCES tb_users.id 
	refresh_token UUID,
	created_at TIMESTAMP DEFAULT NOW(),
	FOREIGN KEY (user_id) REFERENCES auth.tb_users(id) ON DELETE CASCADE
);