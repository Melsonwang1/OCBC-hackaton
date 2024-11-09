USE master;
IF EXISTS(select * from sys.databases where name='FSDP')
DROP DATABASE FSDP;
GO

CREATE DATABASE FSDP;
GO

USE FSDP;
GO

/* UserAccounts Table */
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL,  
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255) NOT NULL UNIQUE,                                     
    nric VARCHAR(9) NOT NULL UNIQUE,                           
    dob DATE NOT NULL,                              
    recovery VARCHAR(255)                           
);

INSERT INTO Users (name, email, password, phoneNumber, nric, dob, recovery)
VALUES 
('John Doe', 'john.doe@example.com', '$2b$10$8mv.PvzwK.9sO4Jdr/7Z9O45nwRBSYW9e9fZzXXrFomiyoDbQteYG', '91234567', 'S1234567A', '1990-05-15', 'john.recovery@example.com'), --123456 (password)
('Jane Smith', 'jane.smith@example.com', '$2b$10$GOP1qXywRBvmy1S.dsf3Cux1ZKQi8vtkp1qcZ1wWij2TwB2HwuYdy', '98765432', 'T2345678B', '1985-10-20', 'jane.recovery@example.com'), -- 135790
('Alex Tan', 'alex.tan@example.com', '$2b$10$YpYdxALLH.2G4LUn9SA4Iuq5aAiUn2uNN8J5OT46d7zhexIoSIKbu', '87654321', 'T3456789C', '2000-01-30', 'alex.recovery@example.com'), -- 726282
('Emily Lim', 'emily.lim@example.com', '$2b$10$lK0KaH/rcUU2KXoCTEhc9.Qi9f2a5Oca5G7Owg86lVZdxW9RkUU1K', '96543210', 'G4567890D', '1995-12-05', 'emily.recovery@example.com'), -- 997766
('Daniel Lee', 'daniel.lee@example.com', '$2b$10$sypEoT7vXX8f1hXt7AxmoOn2YojBfCVvJiEGA455SamOrkeSGFNui', '93218765', 'S5678901E', '1992-03-22', 'daniel.recovery@example.com'); --246810

/* Account Table */
CREATE TABLE Account (
    account_id INT PRIMARY KEY IDENTITY(1,1),
    account_number VARCHAR(15) NOT NULL UNIQUE,      
    account_name VARCHAR(100) NOT NULL,             
    user_id INT,                                    
    balance_have DECIMAL(10, 2) NOT NULL DEFAULT 0.00,  
    balance_owe DECIMAL(10, 2) NOT NULL DEFAULT 0.00,   
    FOREIGN KEY (user_id) REFERENCES Users(user_id)  
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
    period_start DATETIME,  
    period_end DATETIME,   
    profit_loss DECIMAL(10, 2),
    FOREIGN KEY (account_id) REFERENCES Account(account_id)  
);

INSERT INTO Investment (account_id, amount, period_start, period_end, profit_loss)
VALUES 
(1, 1000, '2024-01-05', '2024-01-31', 100),
(1, 1500, '2024-01-15', '2024-01-31', 200),
(1, 1200, '2024-02-10', '2024-02-29', -50),
(1, 2500, '2024-03-20', '2024-03-31', 300),
(1, 2000, '2024-04-05', '2024-04-30', 100),
(2, 3000, '2024-01-10', '2024-01-31', 500),
(2, 3500, '2024-02-15', '2024-02-29', 600),
(2, 3200, '2024-03-25', '2024-03-31', 200),
(2, 4000, '2024-04-10', '2024-04-30', 400),
(2, 4500, '2024-05-18', '2024-05-31', 800),
(3, 1000, '2024-01-03', '2024-01-31', 50),
(3, 1500, '2024-02-05', '2024-02-29', 150),
(3, 1200, '2024-03-14', '2024-03-31', -100),
(3, 2500, '2024-04-20', '2024-04-30', 200),
(4, 2000, '2024-01-15', '2024-01-31', 300),
(4, 2700, '2024-02-28', '2024-02-29', 450),
(4, 1500, '2024-03-22', '2024-03-31', 100),
(4, 4000, '2024-04-12', '2024-04-30', 600),
(5, 1300, '2024-01-20', '2024-01-31', 200),
(5, 2200, '2024-02-10', '2024-02-29', 350),
(5, 1800, '2024-03-15', '2024-03-31', 100),
(5, 3000, '2024-04-25', '2024-04-30', 500),
(5, 1500, '2024-05-02', '2024-05-31', 250);

