USE master
IF EXISTS(select * from sys.databases where name='fsdpSQL')
DROP DATABASE fsdpSQL;
GO

Create Database fsdpSQL;
GO

use fsdpSQL;
GO


user table

user id (primary key) 
password
name
mobile number
nric
email 
dob
recovery (on hold)



account table

account id (primary key)
account name
user id (foreign key)
balance_have
balance_owe

transaction table

transaction id (primary key)
account id(foreign key)
amount 
date of transaction
status
description

investment table 
amount 
account id 
investment id 
profit & lost













CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,        -- Unique identifier for each user
    password VARCHAR(255) NOT NULL,                -- Encrypted password
    name VARCHAR(100) NOT NULL,                     -- Full name of the user
    mobile_number VARCHAR(15),                      -- Contact mobile number
    nric VARCHAR(12) NOT NULL UNIQUE,               -- National registration identification number
    email VARCHAR(100) NOT NULL UNIQUE,             -- Email address
    dob DATE NOT NULL,                              -- Date of birth
    recovery VARCHAR(255),                          -- Recovery information (on hold)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date account was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Last update date
);







CREATE TABLE Account (
    account_id INT PRIMARY KEY AUTO_INCREMENT,      -- Unique account identifier
    account_name VARCHAR(100) NOT NULL,             -- Descriptive name of the account
    user_id INT,                                    -- References user_id from User table
    balance_have DECIMAL(10, 2) NOT NULL DEFAULT 0.00,  -- Positive balance
    balance_owe DECIMAL(10, 2) NOT NULL DEFAULT 0.00,   -- Negative balance (overdrafts, debts)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date account was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last update date
    FOREIGN KEY (user_id) REFERENCES User(user_id)  -- Foreign key constraint
);





CREATE TABLE Transaction (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,  -- Unique transaction identifier
    account_id INT,                                  -- References account_id from Account table
    amount DECIMAL(10, 2) NOT NULL,                 -- Transaction amount
    date_of_transaction DATE NOT NULL,               -- Date of the transaction
    status VARCHAR(50) NOT NULL,                     -- Status of the transaction (e.g., pending, completed)
    description VARCHAR(255),                        -- Description of the transaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Date transaction was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last update date
    FOREIGN KEY (account_id) REFERENCES Account(account_id)  -- Foreign key constraint
);





CREATE TABLE Investment (
    investment_id INT PRIMARY KEY AUTO_INCREMENT,    -- Unique investment identifier
    account_id INT,                                  -- References account_id from Account table
    amount DECIMAL(10, 2) NOT NULL,                 -- Amount invested
    profit_loss DECIMAL(10, 2) DEFAULT 0.00,        -- Profit or loss from the investment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Date investment was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last update date
    FOREIGN KEY (account_id) REFERENCES Account(account_id)  -- Foreign key constraint
);
