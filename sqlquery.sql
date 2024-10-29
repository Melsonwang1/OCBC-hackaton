USE master
IF EXISTS(select * from sys.databases where name='fsdpSQL')
DROP DATABASE fsdpSQL;
GO

Create Database fsdpSQL;
GO

use fsdpSQL;
GO
