--# PostgreSQL Queries
-- Run these queries to initialize and configure the database

CREATE SCHEMA auth;

CREATE TABLE auth.tb_users (
	id SERIAL8 PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL,
	email_confirmed BOOLEAN DEFAULT FALSE,
	email_token UUID, -- Used for email verification
	password_reset_token VARCHAR(255),
	password_reset_provisional VARCHAR(255), 
	password_reset_expiry TIMESTAMP WITH TIME ZONE, -- UTC 
	change_email_token VARCHAR(255),
	change_email_provisional VARCHAR(255), 
	change_email_expiry TIMESTAMP WITH TIME ZONE, -- UTC 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- UTC 
	updated_at TIMESTAMP WITH TIME ZONE -- UTC 
);
CREATE INDEX idx_tb_users_email_hash ON auth.tb_users USING hash (email);
-- Hast indexes are faster for equality comparisons (=) compared to default B-tree indexes.


CREATE TABLE auth.tb_users_tokens (
	id SERIAL PRIMARY KEY,
	user_id INT8 NOT NULL, -- REFERENCES tb_users.id 
	refresh_token TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- UTC 
	FOREIGN KEY (user_id) REFERENCES auth.tb_users(id) ON DELETE CASCADE
);
CREATE INDEX idx_tb_users_tokens_user_id ON auth.tb_users_tokens USING btree (user_id);
