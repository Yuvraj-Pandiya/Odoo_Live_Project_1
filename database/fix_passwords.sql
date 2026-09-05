-- Fix user passwords
-- BCrypt hash for 'Password123!' (strength 12)
SET search_path TO dealflow;

UPDATE users SET password_hash = '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.'
WHERE email LIKE '%dealflow360.com';

SELECT id, email, role FROM users;
