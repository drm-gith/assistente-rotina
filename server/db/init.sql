CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add initial user (password: admin123)
INSERT INTO users (email, password) VALUES 
('emer@example.com', '$2a$10$Tc0Vh0iBq2JB3EKh9NUws.yF1OeJLXtIe09VeSaGR0BJ0wGCLDHwq');

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  diagnosis TEXT,
  sector ENUM('emergencia', 'observacao', 'isolamento') DEFAULT 'emergencia',
  notes TEXT,
  clm BOOLEAN DEFAULT FALSE,
  destination VARCHAR(255),
  labs ENUM('pendentes', 'evoluidos') DEFAULT 'pendentes',
  prescription BOOLEAN DEFAULT FALSE,
  examsPending BOOLEAN DEFAULT FALSE,
  exams JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);