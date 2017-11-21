-- MySQL dump 10.13  Distrib 5.7.20, for Linux (x86_64)
--
-- Host: localhost    Database: quiestleplusriche
-- ------------------------------------------------------
-- Server version	5.7.20-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `SequelizeMeta_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20170914091959-create-bids.js'),('20171120170744-create-connections.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bids` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `img_path` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` mediumtext COLLATE utf8mb4_unicode_ci,
  `price` int(11) NOT NULL,
  `bid_time` bigint(20) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '0',
  `transaction_id` mediumtext COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bids`
--

LOCK TABLES `bids` WRITE;
/*!40000 ALTER TABLE `bids` DISABLE KEYS */;
INSERT INTO `bids` VALUES (7,'Place libre','default.jpg','Qui sera le premier ..?','',0,3509101669,1,NULL,'2017-10-11 01:38:59','2017-11-20 16:24:00'),(8,'Place libre','default.jpg','Qui sera le premier ..?','',0,0,1,NULL,'2017-10-11 01:38:59','2017-10-11 01:38:59'),(9,'Place libre','default.jpg','Qui sera le premier ..?','',0,0,1,NULL,'2017-10-11 01:38:59','2017-10-11 01:38:59'),(10,'Marion','f232cb019a5a6c1ac4dacfcc9420e9bb.jpg','C\'est qui le patron ???','',100,2080798,1,'tok_1BQI3XLW9etOi02s4S400WYL','2017-11-20 16:23:36','2017-11-20 16:58:16'),(11,'Roro','0c67827f15355c9fdd94c0ec11eb43a4.jpg','C\'est le moment d\'investir, prix du bitcoin prévu en 2018 : 11000€ !','https://www.coinbase.com/join/59ad7448c8a1db03152f2237',110,1461521,1,'tok_1BQIapLW9etOi02sV5FZkN92','2017-11-20 16:57:59','2017-11-20 17:22:20'),(12,'Gilettini','1884f16b10bb8f8be97a4f59469bafa7.jpg','attrapez les tous','https://www.valentingillet.com',500,7250910,1,'tok_1BQIy4LW9etOi02seq69IBH2','2017-11-20 17:22:05','2017-11-20 19:22:55'),(13,'Kim','baee0e59f2b52825f729e2f2b481d3ec.jpg','Rocketman','https://www.facebook.com/OfficialKJU/',509,54309627,1,'tok_1BQKqtLW9etOi02svyyxnOhB','2017-11-20 19:22:44','2017-11-21 10:27:53'),(14,'Benkouz','70a757624acda8c142001cd0920a2798.jpg','que du sale ce site mamène','',550,0,1,'tok_1BQYybLW9etOi02szHigvf4t','2017-11-21 10:27:39','2017-11-21 10:27:53');
/*!40000 ALTER TABLE `bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `connections`
--

DROP TABLE IF EXISTS `connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numberConnections` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `connections`
--

LOCK TABLES `connections` WRITE;
/*!40000 ALTER TABLE `connections` DISABLE KEYS */;
INSERT INTO `connections` VALUES (1,266,'2017-11-20 17:37:14','2017-11-21 16:10:07');
/*!40000 ALTER TABLE `connections` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-11-21 16:38:24
