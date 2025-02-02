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
('Fan Zhizhong', 'fanzz2601@gmail.com', '$2b$10$sypEoT7vXX8f1hXt7AxmoOn2YojBfCVvJiEGA455SamOrkeSGFNui', '88696555', 'T0673139I', '2006-01-26', 'fanzz2601.recovery@example.com'); --246810

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
('123-456789-011', 'Fixed Deposit Account', 1, 1063.62, 0.00),
('124-987654-003', 'My Account', 2, 2000.00, 0.00),
('124-987654-004', 'My Credit Account', 2, 0.00, 500.00),
('124-987654-012', 'Fixed Deposit Account', 2, 1065.01, 0.00),
('125-123456-005', 'My Account', 3, 2100.00, 0.00),
('125-123456-006', 'My Investment Account', 3, 2000.00, 0.00),
('125-123456-014', 'Fixed Deposit Account', 3, 1062.93, 0.00),
('126-789456-007', 'My Account', 4, 850.00, 0.00),
('126-789456-008', 'My Loan Account', 4, 0.00, 2500.00),
('126-789456-013', 'Fixed Deposit Account', 4, 1059.47, 0.00),
('127-654321-009', 'My Account', 5, 2000.00, 0.00),
('127-654321-010', 'My Savings Account', 5, 750.00, 0.00),
('127-654321-015', 'Fixed Deposit Account', 5, 1063.68, 0.00);

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
(4, +200.00, '2024-10-31', 'Completed', 'Salary credited', DEFAULT, DEFAULT),
(5, -250.00, '2024-10-30', 'Pending', 'Loan payment scheduled', DEFAULT, DEFAULT),
(7, +300.00, '2024-11-02', 'Completed', 'Transfer from checking account', DEFAULT, DEFAULT),
(8, -50.00, '2024-11-02', 'Pending', 'Service fee deduction', DEFAULT, DEFAULT),
(1, -100.00, '2024-11-03', 'Completed', 'Grocery shopping', DEFAULT, DEFAULT),
(2, +500.00, '2024-11-04', 'Completed', 'Monthly salary bonus', DEFAULT, DEFAULT),
(3, +13.83, '2023-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(3, +15.21, '2023-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT),
(3, +16.60, '2024-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(3, +17.98, '2024-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT),
(6, +13.83, '2023-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(6, +17.98, '2023-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT),
(6, +15.91, '2024-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(6, +17.29, '2024-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT),
(9, +13.83, '2023-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(9, +15.21, '2023-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT),
(9, +15.91, '2024-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(9, +17.98, '2024-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT),
(12, +13.83, '2023-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(12, +14.52, '2023-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT),
(12, +15.21, '2024-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(12, +15.91, '2024-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT),
(15, +13.83, '2023-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(15, +15.21, '2023-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT),
(15, +16.66, '2024-06-30', 'Completed', 'Interest', DEFAULT, DEFAULT),
(15, +17.98, '2024-12-31', 'Completed', 'Interest', DEFAULT, DEFAULT);

/*Add more data for graph*/
INSERT INTO Transactions (account_id, amount, date_of_transaction, status, description, created_at, updated_at)
VALUES
(1, -120.00, '2024-10-05', 'Completed', 'Dinner and shopping', DEFAULT, DEFAULT),
(1, -85.00, '2024-10-12', 'Completed', 'Utility bill payment', DEFAULT, DEFAULT),
(1, -50.00, '2024-10-15', 'Completed', 'Transportation expenses', DEFAULT, DEFAULT),
(1, -200.00, '2024-10-20', 'Completed', 'Loan repayment', DEFAULT, DEFAULT),
(1, -30.00, '2024-10-25', 'Completed', 'Subscription service', DEFAULT, DEFAULT),
(1, -150.00, '2024-08-10', 'Completed', 'Grocery shopping', DEFAULT, DEFAULT),
(1, -100.00, '2024-08-14', 'Completed', 'Electricity bill payment', DEFAULT, DEFAULT),
(1, -75.00, '2024-08-20', 'Completed', 'Dining out', DEFAULT, DEFAULT),
(1, -120.00, '2024-08-25', 'Completed', 'Loan repayment', DEFAULT, DEFAULT);

/* Investment Table */
CREATE TABLE Investment (
    investment_id INT PRIMARY KEY IDENTITY(1,1),    -- Changed from AUTO_INCREMENT
    user_id INT,                  
    account_id VARCHAR(15) NOT NULL,                
    amount DECIMAL(10, 2) NOT NULL,                       
    period_start DATETIME,  
    period_end DATETIME,   
    profit_loss DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (account_id) REFERENCES Account(account_number)
);

INSERT INTO Investment (user_id, account_id, amount, period_start, period_end, profit_loss)
VALUES 
(1, '123-456789-011', 1000, '2023-01-01', '2023-06-30', ROUND(1000 * POWER(1 + 0.002292, 6) - 1000, 2)),  -- 6 months
(1, '123-456789-011', 1100, '2023-07-01', '2023-12-31', ROUND(1100 * POWER(1 + 0.002292, 6) - 1100, 2)),
(1, '123-456789-011', 1200, '2024-01-01', '2024-06-30', ROUND(1200 * POWER(1 + 0.002292, 6) - 1200, 2)),
(1, '123-456789-011', 1300, '2024-07-01', '2024-12-31', ROUND(1300 * POWER(1 + 0.002292, 6) - 1300, 2)),
(2, '124-987654-012', 1000, '2023-01-01', '2023-06-30', ROUND(1000 * POWER(1 + 0.002292, 6) - 1000, 2)),
(2, '124-987654-012', 1050, '2023-07-01', '2023-12-31', ROUND(1050 * POWER(1 + 0.002292, 6) - 1050, 2)),
(2, '124-987654-012', 1150, '2024-01-01', '2024-06-30', ROUND(1150 * POWER(1 + 0.002292, 6) - 1150, 2)),
(2, '124-987654-012', 1250, '2024-07-01', '2024-12-31', ROUND(1250 * POWER(1 + 0.002292, 6) - 1250, 2)),
(3, '125-123456-014', 1000, '2023-01-01', '2023-06-30', ROUND(1000 * POWER(1 + 0.002292, 6) - 1000, 2)),
(3, '125-123456-014', 1100, '2023-07-01', '2023-12-31', ROUND(1100 * POWER(1 + 0.002292, 6) - 1100, 2)),
(3, '125-123456-014', 1150, '2024-01-01', '2024-06-30', ROUND(1150 * POWER(1 + 0.002292, 6) - 1150, 2)),
(3, '125-123456-014', 1300, '2024-07-01', '2024-12-31', ROUND(1300 * POWER(1 + 0.002292, 6) - 1300, 2)),
(4, '126-789456-013', 1000, '2023-01-01', '2023-06-30', ROUND(1000 * POWER(1 + 0.002292, 6) - 1000, 2)),
(4, '126-789456-013', 1050, '2023-07-01', '2023-12-31', ROUND(1050 * POWER(1 + 0.002292, 6) - 1050, 2)),
(4, '126-789456-013', 1100, '2024-01-01', '2024-06-30', ROUND(1100 * POWER(1 + 0.002292, 6) - 1100, 2)),
(4, '126-789456-013', 1150, '2024-07-01', '2024-12-31', ROUND(1150 * POWER(1 + 0.002292, 6) - 1150, 2)),
(5, '127-654321-015', 1000, '2023-01-01', '2023-06-30', ROUND(1000 * POWER(1 + 0.002292, 6) - 1000, 2)),
(5, '127-654321-015', 1100, '2023-07-01', '2023-12-31', ROUND(1100 * POWER(1 + 0.002292, 6) - 1100, 2)),
(5, '127-654321-015', 1200, '2024-01-01', '2024-06-30', ROUND(1200 * POWER(1 + 0.002292, 6) - 1200, 2)),
(5, '127-654321-015', 1300, '2024-07-01', '2024-12-31', ROUND(1300 * POWER(1 + 0.002292, 6) - 1300, 2));

CREATE TABLE Posts (
    post_id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Posts (username, content)
VALUES
('Alice', 'How do I apply for a loan on the OCBC website?'),
('Bob', 'The new investment page is great! Are there any tutorials available?'),
('Charlie', 'I faced some issues accessing my account. Any tips?'),
('Diana', 'Does OCBC provide a tool to calculate fixed deposit interest?');

CREATE TABLE Replies (
    reply_id INT PRIMARY KEY IDENTITY(1,1),
    post_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id)
);

INSERT INTO Replies (post_id, username, content)
VALUES
-- Replies to Alice's post
(1, 'Eve', 'You can apply for a loan by visiting the "Loans" section on the OCBC website. Let me know if you need more details.'),
(1, 'Frank', 'There’s a guide under the FAQ section that explains the loan application process.'),

-- Replies to Bob's post
(2, 'Grace', 'Yes, there are tutorials available on the OCBC YouTube channel. They’re really helpful!'),
(2, 'Henry', 'You can also check the Help section on the investment page itself.'),

-- Replies to Charlie's post
(3, 'Alice', 'I had a similar issue last week. Clearing my browser cache helped.'),
(3, 'Bob', 'You might want to try resetting your password. It worked for me.'),

-- Replies to Diana's post
(4, 'Charlie', 'Yes, OCBC has a fixed deposit calculator. You can find it on the Fixed Deposit page.'),
(4, 'Diana', 'Thank you, Charlie! I’ll check it out.'),
(4, 'Grace', 'If you still have questions, their customer service team is very responsive.');

CREATE TABLE chatbot_responses (
    id INT PRIMARY KEY IDENTITY(1,1),
    question NVARCHAR(MAX) NOT NULL,
    response NVARCHAR(MAX) NOT NULL
);

INSERT INTO chatbot_responses (question, response)
VALUES 
('Hi', 'Hello! How may I assist you today?'),
('Hello', 'Hello! How may I assist you today?'),
('Where can I view my transaction history?', 'You can view your transaction history by clicking into any one of your accounts.'),
('Where can I find the OCBC branches?', 'You can find our branches by clicking on the "Find Branches" button under the "Services" section.'),
('How do I change the language?', 'You can change the website language at the top of the webpage. Currently, we support English and Chinese.'),
('If I need other assistance, where can I find you?', 'The "AI Assistant" button is located right above your bank accounts. Click on it anytime to return and ask me for help.'),
('The words are too small/big, how can I change the font size?', 'You can adjust the font size using the "Enlarge" or "Shrink" buttons at the top of the webpage.'),
('What should I do if I want to exchange currencies?', 'We offer a currency exchange service. Click on the "Currency Exchange" button to proceed.'),
('Is there a function for text-to-speech?', 'Yes! You can enable "Hover to Listen," which will read text aloud when you hover your cursor over an element.'),
('I want to view my accounts', 'You can view all your accounts in the "View Accounts" tab, including My Account, My Savings Account, and Fixed Deposit Account.'),
('How can I do investments?', 'Go to the "Investments" tab to explore investment options. You can also check your investment graph there to track progress.'),
('How can I log out of my account?', 'You can log out by clicking the "Logout" button located at the top right corner of the webpage.'),
('I want to transfer money', 'To transfer money, go to the "Transfer Money" tab, fill in the details, and complete your transfer.'),
('I am new here, how can I navigate around?', 'Our website has a walkthrough feature to guide you. After completing it, you’ll find navigation easier.'),
('How can I switch to dark mode?', 'On the top right corner of the webpage, there is a toggle for dark mode. You can switch back to light mode anytime.'),
('How do I delete my transaction history?', 'You can clear specific transactions by selecting them and clicking "Delete Selected Transaction." However, some records may be retained for security reasons.'),
('How do I contact customer service?', 'You can reach customer service by emailing support@example.com or calling our support hotline at "66789999".'),
('What is the Peer Support Forum?', 'The Peer Support Forum is a community space where you can ask financial questions, get advice, and help others by sharing your knowledge.'),
('I do not have a mouse with me currently, can I navigate the website using just my keyboard?', 'Yes! On the right-hand side of the webpage, there is a list of keyboard shortcuts to help you navigate without a mouse.')

ALTER TABLE Users
ADD food_limit DECIMAL(18, 2) DEFAULT 5000,
    fashion_limit DECIMAL(18, 2) DEFAULT 5000,
    groceries_limit DECIMAL(18, 2) DEFAULT 5000,
    entertainment_limit DECIMAL(18, 2) DEFAULT 5000,
    transport_limit DECIMAL(18, 2) DEFAULT 5000;