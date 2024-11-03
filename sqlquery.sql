USE master;
IF EXISTS(select * from sys.databases where name='FSDP')
DROP DATABASE FSDP;
GO

CREATE DATABASE FSDP;
GO

USE FSDP;
GO

/* UserAccounts Table */
CREATE TABLE UserAccounts (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL,  
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255) NOT NULL UNIQUE,                                     
    nric VARCHAR(9) NOT NULL UNIQUE,                           
    dob DATE NOT NULL,                              
    recovery VARCHAR(255)                           
);

INSERT INTO UserAccounts (name, email, password, phoneNumber, nric, dob, recovery)
VALUES 
('John Doe', 'john.doe@example.com', 'password123', '91234567', 'S1234567A', '1990-05-15', 'john.recovery@example.com'),
('Jane Smith', 'jane.smith@example.com', 'securePass456', '98765432', 'T2345678B', '1985-10-20', 'jane.recovery@example.com'),
('Alex Tan', 'alex.tan@example.com', 'alexPass789', '87654321', 'F3456789C', '2000-01-30', 'alex.recovery@example.com'),
('Emily Lim', 'emily.lim@example.com', 'emilySecret321', '96543210', 'G4567890D', '1995-12-05', 'emily.recovery@example.com'),
('Daniel Lee', 'daniel.lee@example.com', 'danielSecure654', '93218765', 'S5678901E', '1992-03-22', 'daniel.recovery@example.com'),
('Sophia Chia', 'sophia.chia@example.com', 'sophiaSafe987', '91827364', 'T6789012F', '1988-08-14', 'sophia.recovery@example.com');

/* Account Table */
CREATE TABLE Account (
    account_id INT PRIMARY KEY IDENTITY(1,1),
    account_number VARCHAR(15) NOT NULL UNIQUE,      
    account_name VARCHAR(100) NOT NULL,             
    user_id INT,                                    
    balance_have DECIMAL(10, 2) NOT NULL DEFAULT 0.00,  
    balance_owe DECIMAL(10, 2) NOT NULL DEFAULT 0.00,   
    FOREIGN KEY (user_id) REFERENCES UserAccounts(user_id)  
);

INSERT INTO Account (account_number, account_name, user_id, balance_have, balance_owe)
VALUES 
('123-456789-001', 'My Account', 1, 1500.75, 0.00),
('123-456789-002', 'My OCBC Savings Account', 1, 2000.75, 0.00),
('124-987654-003', 'My Account', 2, 2000.00, 0.00),
('124-987654-004', 'My Credit Account', 2, 0.00, 500.00),
('125-123456-005', 'My Account', 3, 2100.00, 0.00),
('125-123456-006', 'My Investment Account', 3, 2000.00, 0.00),
('126-789456-007', 'My Account', 4, 850.00, 0.00),
('126-789456-008', 'My Loan Account', 4, 0.00, 2500.00),
('127-654321-009', 'My Account', 5, 2000.00, 0.00),
('127-654321-010', 'My Savings Account', 5, 750.00, 0.00);

/* Transaction Table */
CREATE TABLE Transactions (
    transaction_id INT PRIMARY KEY IDENTITY(1000,1),  
    account_id INT,                                  
    amount DECIMAL(10, 2) NOT NULL,                 
    date_of_transaction DATE NOT NULL,               
    status VARCHAR(50) NOT NULL,                     
    description VARCHAR(255),                        
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,    
    FOREIGN KEY (account_id) REFERENCES Account(account_id)  
);

INSERT INTO Transactions (account_id, amount, date_of_transaction, status, description, created_at, updated_at)
VALUES 
(1, +150.00, '2024-11-01', 'Completed', 'Deposit to savings account', DEFAULT, DEFAULT),
(2, -75.00, '2024-11-01', 'Completed', 'Payment for utility bill', DEFAULT, DEFAULT),
(3, +200.00, '2024-10-31', 'Completed', 'Salary credited', DEFAULT, DEFAULT),
(4, -250.00, '2024-10-30', 'Pending', 'Loan payment scheduled', DEFAULT, DEFAULT),
(5, +300.00, '2024-11-02', 'Completed', 'Transfer from checking account', DEFAULT, DEFAULT),
(6, -50.00, '2024-11-02', 'Pending', 'Service fee deduction', DEFAULT, DEFAULT),
(1, -100.00, '2024-11-03', 'Completed', 'Grocery shopping', DEFAULT, DEFAULT),
(2, +500.00, '2024-11-04', 'Completed', 'Monthly salary bonus', DEFAULT, DEFAULT);

/* Investment Table */
CREATE TABLE Investment (
    investment_id INT PRIMARY KEY IDENTITY(1,1),    -- Changed from AUTO_INCREMENT
    account_id INT,                                  
    amount DECIMAL(10, 2) NOT NULL,                 
    profit_loss DECIMAL(10, 2) DEFAULT 0.00,        
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,   
    FOREIGN KEY (account_id) REFERENCES Account(account_id)  
);
